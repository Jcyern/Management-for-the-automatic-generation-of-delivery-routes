/**
 * Unit tests for the `Login` page component.
 *
 * Covers form rendering, validation hints when the form is invalid,
 * successful login navigation, and error display on failed login.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { AuthProvider } from '../../context/AuthContext';
import type { User } from '../../types/auth';
import { authService } from '../../services/authService';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../components/GlobeBackground/GlobeBackground', () => ({
  GlobeBackground: () => null,
}));

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const mockUser: User = {
  id: '1',
  name: 'Test',
  email: 'test@test.com',
  role: 'coordinador',
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('should render the login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show a validation hint when the form is invalid and the button escapes', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo electrónico/i);

    await userEvent.type(emailInput, 'invalid-email');

    const button = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.mouseMove(button);

    expect(await screen.findByText(/el correo no tiene un formato válido/i)).toBeInTheDocument();
  });

  it('should call login and navigate on successful submit', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser);

    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show an error message on failed login', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Credenciales incorrectas'));

    renderLogin();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument();
  });
});