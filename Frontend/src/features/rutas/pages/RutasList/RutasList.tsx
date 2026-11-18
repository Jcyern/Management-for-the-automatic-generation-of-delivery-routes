import { useState, useEffect } from 'react';
import { Route, Settings2, Truck } from 'lucide-react';
import { rutasService } from '../../services/rutasService';
import type { Pedido } from '../../../pedidos/types/pedido';
import './RutasList.css';

/**
 * Page for generating and managing delivery routes.
 * Allows selecting available orders and simulating route generation.
 *
 * @returns The RutasList component.
 */
export function RutasList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const data = await rutasService.getPedidosDisponibles();
        setPedidos(data);
      } catch (error) {
        console.error("Error cargando pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(pedidos.map(p => p.id));
  const deselectAll = () => setSelectedIds([]);
  
  const selectCritical = () => {
    const critical = pedidos.filter(p => p.prioridad === 'urgente').map(p => p.id);
    setSelectedIds(critical);
  };

  const handleGenerateRuta = async () => {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);
    try {
      await rutasService.generateRuta(selectedIds);
      alert('¡Ruta generada con éxito! (Simulación)');
      setSelectedIds([]);
    } catch (error) {
      alert('Error al generar la ruta');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rutas-container">
      <div className="rutas-header">
        <div>
          <h1 className="page-title">Generación de Rutas</h1>
          <p className="page-subtitle">
            Selecciona los pedidos para generar una ruta optimizada.
          </p>
        </div>
        <button 
          className="btn-primary" 
          disabled={selectedIds.length === 0 || isGenerating}
          onClick={handleGenerateRuta}
        >
          <Route size={18} />
          {isGenerating ? 'Generando...' : `Generar Ruta (${selectedIds.length})`}
        </button>
      </div>

      <div className="rutas-grid">
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ruta-card" style={{ padding: '0.75rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={selectAll} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Seleccionar Todos</button>
            <button onClick={selectCritical} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-alert)' }}>Solo Críticos</button>
            <button onClick={deselectAll} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Deseleccionar</button>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Mostrando <strong>{pedidos.length}</strong> pedidos
            </span>
          </div>

          <div className="ruta-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-low)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Pedidos Disponibles</h2>
            </div>
            
            {isLoading ? (
              <div className="page-loading">Cargando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No hay pedidos en la base de datos.</div>
            ) : (
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>ID / Zona</th>
                    <th>Tipo</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p.id} style={{ backgroundColor: selectedIds.includes(p.id) ? 'var(--color-surface-low)' : 'transparent' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelection(p.id)}
                        />
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary-dark)' }}>#PED-{p.id}</strong><br/>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.zonaId}</span>
                      </td>
                      <td>{p.tipoEntrega}</td>
                      <td>
                        <span className={p.prioridad === 'urgente' ? 'badge badge--urgente' : 'badge badge--baja'}>
                          {p.prioridad.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ruta-card">
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={18} /> Resumen de Selección
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--color-surface-low)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Pedidos seleccionados</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                  {selectedIds.length}
                </div>
              </div>

              <div style={{ background: 'var(--color-surface-low)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Perfil de Vehículo</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
                  <Truck size={18} /> Van Standard (850 kg)
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}