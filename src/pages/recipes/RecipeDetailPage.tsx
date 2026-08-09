import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MonitorPlay, Edit, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/ToastContext';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { useDataStore } from '../../store/useDataStore';
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
  
  const recipes = useDataStore(s => s.recipes);
  const deleteStoreRecipe = useDataStore(s => s.deleteRecipe);
  
  const recipe = recipes.find(r => r.id === id) || recipes[0]; // Fallback to first
  const isBakerOnly = isBaker && !isAdmin;

  if (!recipe) {
    return <div>Receta no encontrada</div>;
  }

  // Calculate costs
  const totalCost = recipe.items ? recipe.items.reduce((sum, item) => sum + (item.total_cost || 0), 0) : 0;
  const currentPrice = recipe.sale_price || 0;
  const margin = currentPrice > 0 ? ((currentPrice - totalCost) / currentPrice) * 100 : 0;
  const suggestedPrice = totalCost * 2.5; // Sugiere 60% margen
  const isLowMargin = margin < 30;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
      if (error) throw error;
      deleteStoreRecipe(recipe.id);
      toast.success('Receta eliminada correctamente');
      navigate('/recetas');
    } catch (err: any) {
      console.error(err);
      deleteStoreRecipe(recipe.id);
      toast.info('Eliminada localmente');
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
          <Link to="/recetas" className="mr-4 text-muted hover:text-primary">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="page-title text-3xl font-bold font-poppins text-text">{recipe.name}</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowKDS(true)}
            className="btn-ghost px-4 py-2 rounded-lg text-primary border border-border hover:bg-bg flex items-center"
          >
            <MonitorPlay size={18} className="mr-2" />
            Modo KDS
          </button>
          {!isBakerOnly && (
            <Link 
              to={`/recetas/${recipe.id}/editar`}
              className="btn-primary px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center"
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
          <div className="glass-card bg-surface rounded-2xl overflow-hidden border border-border shadow-sm">
            <div className="h-64 bg-gradient-to-br from-[#D6BBFB] to-[#6C5CE7]">
              {/* Image placeholder */}
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="badge-primary bg-secondary-light text-primary px-3 py-1 rounded-full text-sm font-semibold">
                  {recipe.category}
                </span>
              </div>
              <p className="text-muted font-inter mb-4">{recipe.description || 'Sin descripción'}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="bg-bg p-3 rounded-lg">
                  <span className="block font-semibold text-text">Porciones</span>
                  <span className="text-primary text-lg font-bold">{recipe.yield_portions}</span>
                </div>
                <div className="bg-bg p-3 rounded-lg">
                  <span className="block font-semibold text-text">Tiempo Prep.</span>
                  <span className="text-primary text-lg font-bold">{recipe.prep_minutes} min</span>
                </div>
                <div className="bg-bg p-3 rounded-lg col-span-2">
                  <span className="block font-semibold text-text">Tipo de Molde</span>
                  <span className="text-muted capitalize">{recipe.mold_type}</span>
                </div>
              </div>

              {!isBakerOnly && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-text mb-2 flex items-center">
                    <TrendingUp size={16} className="mr-1 text-primary" />
                    Inteligencia de Rentabilidad
                  </h3>
                  
                  {isLowMargin ? (
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-danger-dark mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-danger-dark mb-1">Riesgo de Rentabilidad</p>
                          <p className="text-xs text-danger-dark/80">Tu margen actual es del <strong>{margin.toFixed(1)}%</strong>. El costo de insumos es demasiado alto respecto a tu precio de venta actual (${currentPrice.toFixed(2)}).</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-4">
                      <p className="text-xs font-bold text-success-dark mb-1">Margen Saludable</p>
                      <p className="text-xs text-success-dark/80">Mantienes un margen operativo del <strong>{margin.toFixed(1)}%</strong>. Excelente rentabilidad.</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm bg-bg p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted">Costo Insumos:</span>
                      <span className="font-bold">${totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Precio Sugerido (60%):</span>
                      <span className="font-bold text-primary">${suggestedPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg mt-2 pt-2 border-t border-border">
                      <span className="font-bold text-text">Precio Actual:</span>
                      <span className={`font-bold ${isLowMargin ? 'text-danger' : 'text-success'}`}>${currentPrice.toFixed(2)}</span>
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
          <div className="glass-card bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-text mb-4">Ingredientes</h2>
            <div className="overflow-x-auto">
              <table className="marea-table w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted text-sm font-medium">
                    <th className="pb-3 pl-2">Ingrediente</th>
                    <th className="pb-3">Cantidad</th>
                    <th className="pb-3">Unidad</th>
                    {!isBakerOnly && <th className="pb-3 text-right">Costo Unit.</th>}
                    {!isBakerOnly && <th className="pb-3 text-right pr-2">Subtotal</th>}
                  </tr>
                </thead>
                <tbody>
                  {recipe.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 pl-2 text-text font-medium">{item.ingredient_name}</td>
                      <td className="py-3 text-muted">{item.quantity}</td>
                      <td className="py-3 text-muted">{item.unit}</td>
                      {!isBakerOnly && <td className="py-3 text-right text-muted">${item.cost_per_unit.toFixed(4)}</td>}
                      {!isBakerOnly && <td className="py-3 text-right text-text font-medium pr-2">${item.total_cost.toFixed(2)}</td>}
                    </tr>
                  ))}
                  {(!recipe.items || recipe.items.length === 0) && (
                    <tr className="border-b border-gray-100">
                      <td colSpan={isBakerOnly ? 3 : 5} className="py-3 pl-2 text-muted text-center">Sin ingredientes</td>
                    </tr>
                  )}
                </tbody>
                {!isBakerOnly && (
                  <tfoot>
                    <tr className="bg-bg">
                      <td colSpan={4} className="py-3 pl-2 font-bold text-right">Total Ingredientes:</td>
                      <td className="py-3 font-bold text-right text-primary pr-2">${totalCost.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="glass-card bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-text mb-4">Instrucciones</h2>
            <div className="space-y-4">
              {recipe.steps ? (
                recipe.steps.split('\n').filter(s => s.trim()).map((step, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-light text-primary flex items-center justify-center font-bold mr-4">
                      {index + 1}
                    </div>
                    <p className="text-text font-inter pt-1">{step}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted font-inter">Sin instrucciones disponibles.</p>
              )}
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
