/**
 * Unit tests for the `ParadaForm` component.
 *
 * Covers the default state, uppercase payload values and the guard that
 * rejects non-numeric order ids.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParadaForm } from './ParadaForm';

describe('ParadaForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should default to PENDIENTE and submit the expected payload', async () => {
    render(<ParadaForm idPedido="3" onSubmit={onSubmit} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /crear parada/i }));

    expect(onSubmit).toHaveBeenCalledWith({ idPedido: 3, estadoEjecucion: 'PENDIENTE' });
  });

  it('should submit the selected state in uppercase', async () => {
    render(<ParadaForm idPedido="7" onSubmit={onSubmit} onCancel={onCancel} />);

    await userEvent.selectOptions(screen.getByLabelText(/estado inicial/i), 'EN_CAMINO');
    await userEvent.click(screen.getByRole('button', { name: /crear parada/i }));

    expect(onSubmit).toHaveBeenCalledWith({ idPedido: 7, estadoEjecucion: 'EN_CAMINO' });
  });

  it('should block non-numeric order ids', async () => {
    render(<ParadaForm idPedido="P-001" onSubmit={onSubmit} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: /crear parada/i }));

    expect(await screen.findByText(/id numérico válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
