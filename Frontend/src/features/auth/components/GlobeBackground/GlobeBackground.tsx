/**
 * Animated background featuring a simulated 3D globe rendered on Canvas 2D.
 *
 * Displays country borders loaded from `/public/world.geojson` and draws
 * connecting lines between them, simulating delivery routes that trace
 * themselves in real time. The globe rotates slowly on its Y axis, and
 * points are projected with perspective.
 *
 * Purely decorative: it has `pointer-events: none` and does not interfere
 * with the UI. Rendered behind the login card.
 */

import { useEffect, useRef } from 'react';
import './GlobeBackground.css';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Country {
  name: string;
  lines: Point3D[][];  
  centroid: Point3D;    
}

interface ActiveLine {
  a: Point3D;
  b: Point3D;
  progress: number;
  speed: number;
  state: 'drawing' | 'holding' | 'fading';
  opacity: number;
  holdTime: number;
  maxHoldTime: number;
}

/**
 * Converts geographic coordinates (longitude, latitude) to a point
 * on the unit sphere in 3D space.
 *
 * @param lon - Longitude in degrees (-180 to 180).
 * @param lat - Latitude in degrees (-90 to 90).
 * @returns A point on the unit sphere.
 */
function lonLatTo3D(lon: number, lat: number): Point3D {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * Interpolates between two points on a sphere along the great circle
 * that connects them.
 *
 * @param a - Starting point on the unit sphere.
 * @param b - Ending point on the unit sphere.
 * @param t - Interpolation factor between 0 (at `a`) and 1 (at `b`).
 * @returns The interpolated point on the great circle.
 */
function greatCircle(a: Point3D, b: Point3D, t: number): Point3D {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  if (sinOmega < 0.0001) return { ...a };
  const c1 = Math.sin((1 - t) * omega) / sinOmega;
  const c2 = Math.sin(t * omega) / sinOmega;
  return {
    x: a.x * c1 + b.x * c2,
    y: a.y * c1 + b.y * c2,
    z: a.z * c1 + b.z * c2,
  };
}

export function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const countriesRef = useRef<Country[]>([]);

  useEffect(() => {
    fetch('/world.geojson')
      .then((res) => res.json())
      .then((data) => {
        const countries: Country[] = [];

        for (const feature of data.features) {
          const name = feature.properties?.NAME || feature.properties?.name || '';
          const geom = feature.geometry;
          if (!geom) continue;

          const lines: Point3D[][] = [];
          let sumX = 0, sumY = 0, sumZ = 0, count = 0;

          const processRing = (ring: number[][]) => {
            const step = Math.max(1, Math.floor(ring.length / 90));
            const line: Point3D[] = [];
            for (let i = 0; i < ring.length; i += step) {
              const [lon, lat] = ring[i];
              const p = lonLatTo3D(lon, lat);
              line.push(p);
              sumX += p.x; sumY += p.y; sumZ += p.z; count++;
            }
            if (line.length >= 2) lines.push(line);
          };

          if (geom.type === 'Polygon') {
            for (const ring of geom.coordinates) processRing(ring);
          } else if (geom.type === 'MultiPolygon') {
            for (const polygon of geom.coordinates) {
              for (const ring of polygon) processRing(ring);
            }
          }

          if (lines.length === 0 || count === 0) continue;

          const cLen = Math.sqrt(sumX * sumX + sumY * sumY + sumZ * sumZ) || 1;
          const centroid = {
            x: sumX / cLen,
            y: sumY / cLen,
            z: sumZ / cLen,
          };

          countries.push({ name, lines, centroid });
        }

        countriesRef.current = countries;
      })
      .catch((err) => console.error('Error cargando world.geojson:', err));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_ACTIVE_LINES = 14;
    const LINE_SPEED_MIN = 1 / 2600;
    const LINE_SPEED_MAX = 1 / 1200;
    const HOLD_TIME_MIN = 500;
    const HOLD_TIME_MAX = 1400;
    const FADE_SPEED = 1 / 800;
    const ROTATION_SPEED = 0.00008;
    const TILT = -0.32;
    const HORIZON = 0.01; 

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const glowSprite = document.createElement('canvas');
    glowSprite.width = 64;
    glowSprite.height = 64;
    const gctx = glowSprite.getContext('2d')!;
    const gGrad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gGrad.addColorStop(0, 'rgba(210, 240, 255, 1)');
    gGrad.addColorStop(0.35, 'rgba(150, 210, 255, 0.45)');
    gGrad.addColorStop(1, 'rgba(150, 210, 255, 0)');
    gctx.fillStyle = gGrad;
    gctx.fillRect(0, 0, 64, 64);

    let rotationY = 0;
    const activeLines: ActiveLine[] = [];
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      rotationY += ROTATION_SPEED * dt;

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.78;
      
      const cameraDist = 3.4;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(TILT);
      const sinX = Math.sin(TILT);

      const project = (p: Point3D) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const scale = cameraDist / (cameraDist - z2);
        return {
          x: cx + x1 * radius * scale,
          y: cy + y1 * radius * scale,
          z: z2,
          scale,
          visible: z2 > HORIZON,
        };
      };

      ctx.clearRect(0, 0, width, height);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const countries = countriesRef.current;

      for (const country of countries) {
        for (const line of country.lines) {
          ctx.beginPath();
          let penDown = false;

          for (let i = 0; i < line.length; i++) {
            const proj = project(line[i]);

            if (!proj.visible) {
              penDown = false;
              continue;
            }

            const alpha = Math.min(1, proj.z * 2.2);

            if (!penDown) {
              ctx.moveTo(proj.x, proj.y);
              penDown = true;
            } else {
              ctx.lineTo(proj.x, proj.y);
            }

            ctx.strokeStyle = `rgba(120, 180, 235, ${0.35 * alpha})`;
          }
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      for (let i = activeLines.length - 1; i >= 0; i--) {
        const line = activeLines[i];
        if (line.state === 'drawing') {
          line.progress += line.speed * dt;
          if (line.progress >= 1) {
            line.progress = 1;
            line.state = 'holding';
          }
        } else if (line.state === 'holding') {
          line.holdTime += dt;
          if (line.holdTime >= line.maxHoldTime) line.state = 'fading';
        } else if (line.state === 'fading') {
          line.opacity -= FADE_SPEED * dt;
          if (line.opacity <= 0) activeLines.splice(i, 1);
        }
      }

      if (countries.length > 0) {
        while (activeLines.length < MAX_ACTIVE_LINES) {
          const a = countries[Math.floor(Math.random() * countries.length)];
          let b = countries[Math.floor(Math.random() * countries.length)];
          let attempts = 0;
          while (b === a && attempts < 10) {
            b = countries[Math.floor(Math.random() * countries.length)];
            attempts++;
          }
          if (b === a) continue;

          const pa = project(a.centroid);
          const pb = project(b.centroid);
          if (!pa.visible && !pb.visible) continue;

          activeLines.push({
            a: a.centroid,
            b: b.centroid,
            progress: 0,
            speed: LINE_SPEED_MIN + Math.random() * (LINE_SPEED_MAX - LINE_SPEED_MIN),
            state: 'drawing',
            opacity: 1,
            holdTime: 0,
            maxHoldTime: HOLD_TIME_MIN + Math.random() * (HOLD_TIME_MAX - HOLD_TIME_MIN),
          });
        }
      }

      for (const line of activeLines) {
        if (line.progress < 0.01) continue;

        const SEGMENTS = 40;
        const segmentsToDraw = Math.max(2, Math.floor(SEGMENTS * line.progress));

        ctx.beginPath();
        let penDown = false;

        for (let i = 0; i <= segmentsToDraw; i++) {
          const t = i / SEGMENTS;
          const p3d = greatCircle(line.a, line.b, t);
          const proj = project(p3d);

          if (!proj.visible) {
            penDown = false;
            continue;
          }

          if (!penDown) {
            ctx.moveTo(proj.x, proj.y);
            penDown = true;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }

        const grad = ctx.createLinearGradient(
          project(line.a).x, project(line.a).y,
          project(greatCircle(line.a, line.b, line.progress)).x,
          project(greatCircle(line.a, line.b, line.progress)).y
        );
        grad.addColorStop(0, `rgba(100, 180, 240, ${0.5 * line.opacity})`);
        grad.addColorStop(0.6, `rgba(160, 220, 255, ${0.85 * line.opacity})`);
        grad.addColorStop(1, `rgba(240, 250, 255, ${1.0 * line.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        if (line.state === 'drawing') {
          const head = project(greatCircle(line.a, line.b, line.progress));
          if (head.visible) {
            const headSize = 12;
            ctx.globalAlpha = 0.85 * line.opacity;
            ctx.drawImage(
              glowSprite,
              head.x - headSize,
              head.y - headSize,
              headSize * 2,
              headSize * 2
            );
            ctx.globalAlpha = 1;
          }
        }
      }

      for (const country of countries) {
        const proj = project(country.centroid);
        if (!proj.visible) continue;
        const alpha = Math.min(1, proj.z * 2);
        const size = 1.5 * proj.scale;
        const glowSize = size * 4;

        ctx.globalAlpha = alpha * 0.7;
        ctx.drawImage(
          glowSprite,
          proj.x - glowSize,
          proj.y - glowSize,
          glowSize * 2,
          glowSize * 2
        );
        ctx.globalAlpha = 1;

        ctx.fillStyle = `rgba(230, 245, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="globe-background" />;
}