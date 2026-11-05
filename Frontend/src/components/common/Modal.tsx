import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  /** Whether the modal is currently open. */
  isOpen: boolean;

  /** Title displayed at the top of the modal. */
  title: string;

  /** Callback fired when the modal should close. */
  onClose: () => void;

  /** Content rendered inside the modal body. */
  children: ReactNode;

  /** Optional footer content, usually action buttons. */
  footer?: ReactNode;
}

/**
 * Generic modal dialog.
 *
 * Closes on Escape key press and on backdrop click. Locks body scroll
 * while open.
 */
export function Modal({ isOpen, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">{children}</div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}