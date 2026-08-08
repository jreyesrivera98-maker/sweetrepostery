import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { mockRecipes } from '../../lib/mockData';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';

export const RecipesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [recipes, setRecipes] = useState(mockRecipes);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? recipe.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', deleteId);
      if (error) throw error;
      setRecipes(prev => prev.filter(r => r.id !== deleteId));
      toast.success('Receta eliminada correctamente');
    } catch (err: any) {
      console.error(err);
      setRecipes(prev => prev.filter(r => r.id !== deleteId));
      toast.info('Eliminada localmente (modo mock)');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="recipes-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title text-3xl font-bold font-poppins text-[#2D3436]">Recetario Inteligente</h1>
          <p className="page-subtitle text-[#636E72] font-inter">Administra tus recetas y costos</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/recetas/nueva" className="btn-ghost px-4 py-2 rounded-lg text-[#6C5CE7] border border-[#E8E3FF] hover:bg-[#F4F3FF] flex items-center">
            <Plus size={18} className="mr-2" />
            Nueva Receta
          </Link>
          <Link to="/recetas/nueva?ai=true" className="btn-primary px-4 py-2 rounded-lg bg-[#6C5CE7] text-white hover:bg-[#4834D4] flex items-center">
            <Wand2 size={18} className="mr-2" />
            Crear con IA
          </Link>
        </div>
      </div>

      <div className="filters-section flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636E72]" size={18} />
          <input
            type="text"
            placeholder="Buscar recetas..."
            className="input-marea w-full pl-10 pr-4 py-2 border border-[#E8E3FF] rounded-lg focus:outline-none focus:border-[#6C5CE7]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#636E72]" size={18} />
          <select
            className="input-marea w-full pl-10 pr-4 py-2 border border-[#E8E3FF] rounded-lg focus:outline-none focus:border-[#6C5CE7] appearance-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="Tortas">Tortas</option>
            <option value="Postres">Postres</option>
            <option value="Galletas">Galletas</option>
          </select>
        </div>
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card glass-card bg-[#FDFDFD] rounded-2xl overflow-hidden border border-[#E8E3FF] shadow-sm hover:shadow-md transition-shadow relative">
              <Link to={`/recetas/${recipe.id}`} className="block">
                <div className="h-48 bg-gradient-to-br from-[#D6BBFB] to-[#6C5CE7] relative">
                  {/* Placeholder for image */}
                  {recipe.ai_generated && (
                    <div className="absolute top-2 right-2 badge bg-white text-[#6C5CE7] px-2 py-1 rounded-full text-xs font-bold flex items-center shadow">
                      <Sparkles size={12} className="mr-1" /> IA
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(recipe.id); }}
                    className="absolute top-2 left-2 p-1.5 bg-white text-red-500 rounded-full shadow hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-[#2D3436] font-poppins">{recipe.name}</h3>
                    <span className="badge-primary bg-[#EDE9FF] text-[#6C5CE7] px-2 py-1 rounded-md text-xs font-semibold">
                      {recipe.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#636E72] mb-3 font-inter">
                    <div>
                      <span className="block font-semibold text-[#2D3436]">Porciones:</span>
                      {recipe.yield_portions}
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2D3436]">Prep:</span>
                      {recipe.prep_minutes} min
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2D3436]">Precio Venta:</span>
                      ${recipe.sale_price}
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2D3436]">Molde:</span>
                      <span className="badge bg-gray-100 px-2 py-0.5 rounded text-xs">{recipe.mold_type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[#E8E3FF]">
          <AlertCircle size={48} className="text-[#D6BBFB] mb-4" />
          <h3 className="text-xl font-bold text-[#2D3436] mb-2 font-poppins">No se encontraron recetas</h3>
          <p className="text-[#636E72] font-inter">Intenta con otros términos de búsqueda o filtros.</p>
        </div>
      )}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar receta"
        description="¿Estás seguro de eliminar esta receta? Se perderán todos sus datos y escandallos."
      />
    </div>
  );
};

export default RecipesPage;
