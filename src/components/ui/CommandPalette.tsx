import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, FileText, TrendingUp, Settings, ChevronRight, Calculator } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const orders = useDataStore(s => s.orders);
  const customers = useDataStore(s => s.customers);
  const recipes = useDataStore(s => s.recipes);
  const quotes = useDataStore(s => s.quotes);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleOpen = () => setIsOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const closePalette = () => setIsOpen(false);

  // Generate dynamic results based on query
  const getResults = () => {
    const q = query.toLowerCase();
    
    const actions = [
      { id: 'action-1', title: 'Nuevo Pedido', type: 'Acción', icon: Package, onSelect: () => { navigate('/pedidos'); closePalette(); } },
      { id: 'action-2', title: 'Nuevo Cliente', type: 'Acción', icon: Users, onSelect: () => { navigate('/clientes'); closePalette(); } },
      { id: 'action-3', title: 'Nueva Receta', type: 'Acción', icon: FileText, onSelect: () => { navigate('/recetas/nueva'); closePalette(); } },
      { id: 'action-4', title: 'Nueva Cotización', type: 'Acción', icon: Calculator, onSelect: () => { navigate('/cotizador'); closePalette(); } },
      { id: 'action-5', title: 'Configuración', type: 'Acción', icon: Settings, onSelect: () => { navigate('/configuracion'); closePalette(); } },
      { id: 'action-6', title: 'Ir al Dashboard', type: 'Acción', icon: TrendingUp, onSelect: () => { navigate('/'); closePalette(); } },
    ];

    if (!q) return actions.slice(0, 5); // Default recommendations

    const results = [];

    // Filter Actions
    const matchedActions = actions.filter(a => a.title.toLowerCase().includes(q));
    results.push(...matchedActions);

    // Filter Customers
    const matchedCustomers = customers.filter(c => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    results.push(...matchedCustomers.map(c => ({
      id: `customer-${c.id}`,
      title: c.name,
      type: 'Cliente',
      icon: Users,
      onSelect: () => { navigate('/clientes'); closePalette(); }
    })));

    // Filter Orders
    const matchedOrders = orders.filter(o => o.folio.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q));
    results.push(...matchedOrders.map(o => ({
      id: `order-${o.id}`,
      title: `${o.folio} - ${o.customer_name}`,
      type: 'Pedido',
      icon: Package,
      onSelect: () => { navigate('/pedidos'); closePalette(); }
    })));

    // Filter Recipes
    const matchedRecipes = recipes.filter(r => r.name.toLowerCase().includes(q));
    results.push(...matchedRecipes.map(r => ({
      id: `recipe-${r.id}`,
      title: r.name,
      type: 'Receta',
      icon: FileText,
      onSelect: () => { navigate(`/recetas/${r.id}`); closePalette(); }
    })));

    // Filter Quotes
    const matchedQuotes = (quotes || []).filter(qt => qt.customer_name.toLowerCase().includes(q) || qt.recipe_name?.toLowerCase().includes(q));
    results.push(...matchedQuotes.map(qt => ({
      id: `quote-${qt.id}`,
      title: `${qt.customer_name} ${qt.recipe_name ? `- ${qt.recipe_name}` : ''}`,
      type: 'Cotización',
      icon: Calculator,
      onSelect: () => { navigate('/cotizador'); closePalette(); }
    })));

    return results.slice(0, 8); // Max 8 results
  };

  const results = getResults();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      results[selectedIndex].onSelect();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={closePalette}
      />
      
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-[slideUp_0.2s_ease]">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-text font-inter placeholder:text-muted"
            placeholder="Busca clientes, pedidos, recetas o acciones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
            <kbd className="px-2 py-1 bg-bg border border-border rounded text-xs text-muted font-mono">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {results.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted font-inter">
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors text-left ${
                    index === selectedIndex ? 'bg-bg text-primary' : 'hover:bg-bg/50 text-text'
                  }`}
                  onClick={result.onSelect}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <result.icon className={`w-5 h-5 mr-3 ${index === selectedIndex ? 'text-primary' : 'text-muted'}`} />
                  <div className="flex-1">
                    <span className="font-medium font-inter">{result.title}</span>
                  </div>
                  <span className="text-xs text-muted font-medium bg-surface px-2 py-1 rounded-md border border-border mr-2">
                    {result.type}
                  </span>
                  {index === selectedIndex && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
