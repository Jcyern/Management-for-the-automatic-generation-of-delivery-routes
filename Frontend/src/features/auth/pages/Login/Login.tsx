/**
 * Login page of the system.
 *
 * Features:
 * - Form with email and password, with live validation.
 * - Animated background with a globe and routes being traced between countries.
 * - Submit button that escapes from the pointer when the form is invalid,
 *   forcing the user to fix the data before being able to log in.
 * - Reveals the last typed character of the password for 900 ms.
 *
 * On successful authentication, redirects to the dashboard.
 *
 * @returns The Login page component.
 */

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlobeBackground } from '../../components/GlobeBackground/GlobeBackground';
import './Login.css';
import logo from '../../../../assets/logo.png';
import { MailIcon, LockIcon } from '../../../../components/icons/AuthIcons';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordChar, setShowPasswordChar] = useState(false);
  const [buttonOffset, setButtonOffset] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);

  const passwordTimeoutRef = useRef<number | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isFormValid = (): boolean => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordOk = password.length >= 6;
    return emailOk && passwordOk;
  };

  const getValidationHint = (): string => {
    if (!email.trim()) return 'Introduce tu correo electrónico.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'El correo no tiene un formato válido.';
    if (!password) return 'Introduce tu contraseña.';
    if (password.length < 6)
      return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  };

  const handleUserEditing = () => {
    setHasAttempted(false);
  };

  useEffect(() => {
    return () => {
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFormValid()) {
      setButtonOffset(0);
    }
  }, [email, password]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const form = formRef.current;
      const btn = buttonRef.current;
      if (!form || !btn) return;

      if (isFormValid()) {
        setButtonOffset(0);
        return;
      }

      const formRect = form.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      const naturalButtonX = formRect.left + formRect.width / 2;
      const naturalButtonY = btnRect.top + btnRect.height / 2;

      const dx = e.clientX - naturalButtonX;
      const dy = e.clientY - naturalButtonY;

      const rx = 220;
      const ry = 90;
      const inDanger = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1;

      if (inDanger) {
        const direction = dx >= 0 ? -1 : 1;
        setButtonOffset(direction * 140);
        setHasAttempted(true);
      } else {
        setButtonOffset(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [email, password]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    handleUserEditing();
    setShowPasswordChar(true);
    if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
    passwordTimeoutRef.current = window.setTimeout(() => {
      setShowPasswordChar(false);
    }, 900);
  };

  const handlePasswordBlur = () => {
    if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
    setShowPasswordChar(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formValid = isFormValid();
  const hint = hasAttempted && !formValid ? getValidationHint() : '';

  return (
    <div className="login-container">
      <GlobeBackground />
      <div className="blur-overlay" />
        <div className="login-card">
            <div className="login-logo">
                <img src={logo} alt="Logo del sistema" />
            </div>

        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-with-icon">
              <MailIcon className="input-icon" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleUserEditing();
                }}
                placeholder="usuario@ejemplo.com"
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon password-wrapper">
              <LockIcon className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder="Contraseña"
                disabled={isSubmitting}
                autoComplete="new-password"
                className="password-real"
              />
              <div className="password-overlay" aria-hidden="true">
                {password.split('').map((char, i) => {
                  const isLast = i === password.length - 1;
                  const visible = isLast && showPasswordChar;
                  return (
                    <span key={i} className="char">
                      {visible ? char : '•'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {hint && <div className="validation-hint">{hint}</div>}
          {error && <div className="error-message">{error}</div>}

          <button
            ref={buttonRef}
            type="submit"
            disabled={isSubmitting}
            className={formValid ? '' : 'btn-escape'}
            style={{ transform: `translateX(${buttonOffset}px)` }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-hint">
          <p>Usuarios de prueba:</p>
          <ul>
            <li>coordinador@test.com / password123</li>
            <li>repartidor@test.com / password123</li>
            <li>supervisor@test.com / password123</li>
            <li>admin@test.com / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}