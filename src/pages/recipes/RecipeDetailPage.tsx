import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MonitorPlay, Edit, DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { mockRecipes } from '../../lib/mockData';
import { useRBAC } from '../../hooks/useRBAC';
import { MermaZeroPanel } from '../../components/recipes/MermaZeroPanel';
import { KDSMode } from '../../components/recipes/KDSMode';
import { MoldScaler } from '../../components/recipes/MoldScaler';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showKDS, setShowKDS] = useState(false);
  const { isBaker, isAdmin } = useRBAC();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const recipe = mockRecipes.find(r => r.id === id) || mockRecipes[0]; // Fallback to first
  const isBakerOnly = isBaker && !isAdmin;

  if (!recipe) {
    return <div>Receta no encontrada</div>;
  }

  // Calculate costs
  // Mock ingredients cost logic for demonstration
  const totalCost = recipe.sale_price ? recipe.sale_price * 0.4 : 10;
  const suggestedPrice = totalCost * 2.5;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
      if (error) throw error;
      toast.success('Receta eliminada correctamente');
      navigate('/recetas');
    } catch (err: any) {
      console.error(err);
      toast.info('Eliminada localmente (modo mock)');
      navigate('/recetas');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="recipe-detail-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/recetas" className="mr-4 text-[#636E72] hover:text-[#6C5CE7]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="page-title text-3xl font-bold font-poppins text-[#2D3436]">{recipe.name}</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowKDS(true)}
            className="btn-ghost px-4 py-2 rounded-lg text-[#6C5CE7] border border-[#E8E3FF] hover:bg-[#F4F3FF] flex items-center"
          >
            <MonitorPlay size={18} className="mr-2" />
            Modo KDS
          </button>
          {!isBakerOnly && (
            <Link 
              to={`/recetas/${recipe.id}/editar`}
              className="btn-primary px-4 py-2 rounded-lg bg-[#6C5CE7] text-white hover:bg-[#4834D4] flex items-center"
            >
              <Edit size={18} className="mr-2" />
              Editar
            </Link>
          )}
          {!isBakerOnly && (
            <button 
              onClick={() => setDeleteId(recipe.id)}
              className="btn-primary px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center border border-red-200"
            >
              <Trash2 size={18} className="mr-2" />
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card bg-[#FDFDFD] rounded-2xl overflow-hidden border border-[#E8E3FF] shadow-sm">
            <div className="h-64 bg-gradient-to-br from-[#D6BBFB] to-[#6C5CE7]">
              {/* Image placeholder */}
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="badge-primary bg-[#EDE9FF] text-[#6C5CE7] px-3 py-1 rounded-full text-sm font-semibold">
                  {recipe.category}
                </span>
              </div>
              <p className="text-[#636E72] font-inter mb-4">{recipe.description || 'Sin descripción'}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="bg-[#F4F3FF] p-3 rounded-lg">
                  <span className="block font-semibold text-[#2D3436]">Porciones</span>
                  <span className="text-[#6C5CE7] text-lg font-bold">{recipe.yield_portions}</span>
                </div>
                <div className="bg-[#F4F3FF] p-3 rounded-lg">
                  <span className="block font-semibold text-[#2D3436]">Tiempo Prep.</span>
                  <span className="text-[#6C5CE7] text-lg font-bold">{recipe.prep_minutes} min</span>
                </div>
                <div className="bg-[#F4F3FF] p-3 rounded-lg col-span-2">
                  <span className="block font-semibold text-[#2D3436]">Tipo de Molde</span>
                  <span className="text-[#636E72] capitalize">{recipe.mold_type}</span>
                </div>
              </div>

              {!isBakerOnly && (
                <div className="border-t border-[#E8E3FF] pt-4">
                  <h3 className="font-bold text-[#2D3436] mb-2 flex items-center">
                    <DollarSign size={16} className="mr-1 text-[#6C5CE7]" />
                    Análisis de Costos
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#636E72]">Costo Total Ingredientes:</span>
                      <span className="font-bold">${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#636E72]">Margen Sugerido (60%):</span>
                      <span className="font-bold text-green-600">${(suggestedPrice - totalCost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg mt-2 pt-2 border-t border-[#E8E3FF]">
                      <span className="font-bold text-[#2D3436]">Precio Sugerido:</span>
                      <span className="font-bold text-[#6C5CE7]">${suggestedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <MoldScaler recipe={recipe as any} onScaled={() => {}} />
          <MermaZeroPanel recipe={recipe as any} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-[#2D3436] mb-4">Ingredientes</h2>
            <div className="overflow-x-auto">
              <table className="marea-table w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E3FF] text-[#636E72] text-sm font-medium">
                    <th className="pb-3 pl-2">Ingrediente</th>
                    <th className="pb-3">Cantidad</th>
                    <th className="pb-3">Unidad</th>
                    {!isBakerOnly && <th className="pb-3 text-right">Costo Unit.</th>}
                    {!isBakerOnly && <th className="pb-3 text-right pr-2">Subtotal</th>}
                  </tr>
                </thead>
                <tbody>
                  {/* Mock ingredients rows */}
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pl-2 text-[#2D3436] font-medium">Harina de trigo</td>
                    <td className="py-3 text-[#636E72]">500</td>
                    <td className="py-3 text-[#636E72]">g</td>
                    {!isBakerOnly && <td className="py-3 text-right text-[#636E72]">$0.02</td>}
                    {!isBakerOnly && <td className="py-3 text-right text-[#2D3436] font-medium pr-2">$10.00</td>}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 pl-2 text-[#2D3436] font-medium">Azúcar</td>
                    <td className="py-3 text-[#636E72]">250</td>
                    <td className="py-3 text-[#636E72]">g</td>
                    {!isBakerOnly && <td className="py-3 text-right text-[#636E72]">$0.03</td>}
                    {!isBakerOnly && <td className="py-3 text-right text-[#2D3436] font-medium pr-2">$7.50</td>}
                  </tr>
                </tbody>
                {!isBakerOnly && (
                  <tfoot>
                    <tr className="bg-[#F4F3FF]">
                      <td colSpan={4} className="py-3 pl-2 font-bold text-right">Total Ingredientes:</td>
                      <td className="py-3 font-bold text-right text-[#6C5CE7] pr-2">${totalCost.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-[#2D3436] mb-4">Instrucciones</h2>
            <div className="space-y-4">
              {/* Mock steps */}
              {[
                "Precalentar el horno a 180°C. Preparar el molde engrasado.",
                "Mezclar los ingredientes secos en un bol grande.",
                "Agregar los ingredientes húmedos y batir hasta integrar.",
                "Hornear por 45 minutos."
              ].map((step, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EDE9FF] text-[#6C5CE7] flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </div>
                  <p className="text-[#2D3436] font-inter pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showKDS && <KDSMode recipe={recipe as any} onClose={() => setShowKDS(false)} />}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar receta"
        description="¿Estás seguro de eliminar esta receta? Se perderán todos sus datos permanentemente."
      />
    </div>
  );
};
