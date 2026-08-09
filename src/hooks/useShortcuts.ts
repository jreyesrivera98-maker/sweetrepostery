import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // N -> Nuevo (por defecto Nuevo Pedido, que es la acción más frecuente)
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/pedidos?new=true');
      }

      // / -> Búsqueda Global (abre Command Palette)
      if (e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      
      // K -> Command Palette
      if ((e.key.toLowerCase() === 'k' && !e.ctrlKey && !e.metaKey) || 
          (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
