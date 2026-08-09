import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, Clock, ChefHat } from 'lucide-react';
import { mockRecipes } from '../../lib/mockData';
import { useAppStore } from '../../store/useAppStore';

interface CatalogPageProps {
  isPreviewMode?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ isPreviewMode = false }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<{id: string, qty: number}[]>([]);
  const { settings } = useAppStore();
  
  const publishedProducts = mockRecipes?.filter(r => r.published) || [
    { id: '1', name: 'Pastel de Zanahoria', description: 'Delicioso pastel húmedo con betún de queso crema.', price: 450, category: 'Pasteles', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80' },
    { id: '2', name: 'Brownies Clasicos', description: 'Caja con 6 brownies de chocolate intenso.', price: 180, category: 'Postres', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' }
  ];

  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((acc, item) => {
    const product = publishedProducts.find(p => p.id === item.id);
    return acc + (product?.sale_price || 0) * item.qty;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl font-poppins">M</div>
            <h1 className="text-2xl font-bold font-poppins text-gray-900 tracking-tight">Marea Dulce</h1>
          </div>
          {!isPreviewMode && (
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary text-white py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 max-w-2xl mx-auto leading-tight">
          {settings.catalog_hero_title}
        </h2>
        <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
          {settings.catalog_hero_subtitle}
        </p>
        {!isPreviewMode && (
          <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors shadow-lg">
            Ver Catálogo
          </button>
        )}
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {publishedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                <img src={product.image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent(product.name + ' pastel artesanal')}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 shadow-sm">
                  {product.category}
                </span>
              </div>
              <div className="p-5 flex flex-col h-full">
                <h3 className="font-bold text-lg text-gray-900 mb-1 font-poppins">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                
                {/* Extra info based on config */}
                {(settings.catalog_show_prep || settings.catalog_show_ingredients) && (
                  <div className="mb-4 space-y-2 border-t border-gray-50 pt-4">
                    {settings.catalog_show_prep && product.prep_minutes && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prep: {product.prep_minutes} min</span>
                      </div>
                    )}
                    {settings.catalog_show_ingredients && product.items && (
                      <div className="flex items-start gap-2 text-xs text-gray-500">
                        <ChefHat className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          Ingredientes: {product.items.map(i => i.ingredient_name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="font-bold text-xl text-primary">${product.sale_price} <span className="text-xs text-gray-400 font-normal">MXN</span></span>
                  {!isPreviewMode && (
                    <button onClick={() => addToCart(product.id)} className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold font-poppins text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Tu Carrito
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => {
                  const product = publishedProducts.find(p => p.id === item.id);
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <img src={product.image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent(product.name)}`} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                          <p className="text-primary font-semibold text-sm">${product.sale_price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c).filter(c => c.qty > 0))} className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                          <button onClick={() => addToCart(item.id)} className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-gray-50">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-500">Total a pagar</span>
                  <span className="font-bold text-xl text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                  Completar Pedido <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-500 mt-20">
        <p>© 2026 Marea Dulce. Todos los derechos reservados.</p>
        <a href="/admin" className="text-primary hover:underline mt-2 inline-block font-medium">Acceso Administrativo</a>
      </footer>
    </div>
  );
};
