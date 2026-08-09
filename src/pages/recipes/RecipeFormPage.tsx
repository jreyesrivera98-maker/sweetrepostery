import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Circle, Square, Minus } from 'lucide-react';
import { MareaRecipeAi } from '../../components/recipes/MareaRecipeAi';
import { useDataStore } from '../../store/useDataStore';
import type { Recipe } from '../../types';

export const RecipeFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isAiMode = searchParams.get('ai') === 'true';
  const navigate = useNavigate();
  const addRecipe = useDataStore(state => state.addRecipe);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [yieldPortions, setYieldPortions] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [moldType, setMoldType] = useState('circular');
  const [moldDiameter, setMoldDiameter] = useState('');
  const [moldWidth, setMoldWidth] = useState('');
  const [moldHeight, setMoldHeight] = useState('');
  const [steps, setSteps] = useState('');
  const [margin, setMargin] = useState(60);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '', package_cost: '', package_quantity: '' }]);

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '', package_cost: '', package_quantity: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const calculateTotalCost = () => {
    return ingredients.reduce((total, ing) => {
      const q = parseFloat(ing.quantity) || 0;
      const pc = parseFloat(ing.package_cost) || 0;
      const pq = parseFloat(ing.package_quantity) || 1;
      return total + (q * (pc / pq));
    }, 0);
  };

  const totalCost = calculateTotalCost();
  const salePrice = totalCost / (1 - margin / 100);

  const handleAiGenerated = (recipe: any) => {
    setName(recipe.name || '');
    setDescription(recipe.description || '');
    setSteps(recipe.steps || '');
    if (recipe.prep_minutes) setPrepMinutes(recipe.prep_minutes.toString());
    if (recipe.yield_portions) setYieldPortions(recipe.yield_portions.toString());
    
    if (recipe.items && recipe.items.length > 0) {
      setIngredients(recipe.items.map((item: any) => ({
        name: item.ingredient_name || '',
        quantity: item.quantity?.toString() || '',
        unit: item.unit || '',
        package_cost: '',
        package_quantity: '1'
      })));
    }
  };

  return (
    <div className="recipe-form-page max-w-5xl mx-auto pb-12">
      <div className="page-header mb-6 flex justify-between items-center">
        <h1 className="page-title text-3xl font-bold font-poppins text-[#2D3436]">
          Nueva Receta
        </h1>
        <button onClick={() => {
          if (!name) return;
          const recipe: Recipe = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            description,
            category,
            yield_portions: parseInt(yieldPortions) || 1,
            prep_minutes: parseInt(prepMinutes) || 0,
            image_url: null as any,
            steps,
            margin_percent: margin,
            sale_price: salePrice,
            published: true,
            mold_type: moldType as any,
            mold_dimensions: moldType === 'circular' ? { diameter: parseInt(moldDiameter) || 0 } : moldType === 'rectangular' ? { width: parseInt(moldWidth) || 0, height: parseInt(moldHeight) || 0 } : {},
            items: ingredients.map(ing => ({
              ingredient_id: Math.random().toString(),
              ingredient_name: ing.name,
              quantity: parseFloat(ing.quantity) || 0,
              unit: ing.unit,
              cost_per_unit: (parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1),
              total_cost: (parseFloat(ing.quantity) || 0) * ((parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1))
            })),
            ai_generated: isAiMode,
            created_at: new Date().toISOString()
          };
          addRecipe(recipe);
          navigate('/recetas');
        }} className="btn-primary px-6 py-2 rounded-lg bg-[#6C5CE7] text-white hover:bg-[#4834D4] flex items-center">
          <Save size={18} className="mr-2" />
          Guardar Receta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAiMode && (
            <MareaRecipeAi onRecipeGenerated={handleAiGenerated} />
          )}

          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-[#2D3436] mb-4">Información General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#636E72] mb-1">Nombre de la Receta</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-marea w-full p-2 border border-[#E8E3FF] rounded-lg" placeholder="Ej. Torta de Chocolate" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#636E72] mb-1">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-marea w-full p-2 border border-[#E8E3FF] rounded-lg" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#636E72] mb-1">Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input-marea w-full p-2 border border-[#E8E3FF] rounded-lg">
                    <option value="">Seleccionar...</option>
                    <option value="Tortas">Tortas</option>
                    <option value="Postres">Postres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#636E72] mb-1">Porciones</label>
                  <input type="number" value={yieldPortions} onChange={e => setYieldPortions(e.target.value)} className="input-marea w-full p-2 border border-[#E8E3FF] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#636E72] mb-1">Tiempo (min)</label>
                  <input type="number" value={prepMinutes} onChange={e => setPrepMinutes(e.target.value)} className="input-marea w-full p-2 border border-[#E8E3FF] rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-[#2D3436] mb-4">Tipo de Molde</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className={`p-4 rounded-lg border-2 cursor-pointer flex flex-col items-center ${moldType === 'circular' ? 'border-[#6C5CE7] bg-[#EDE9FF]' : 'border-[#E8E3FF]'}`} onClick={() => setMoldType('circular')}>
                <Circle size={32} className={moldType === 'circular' ? 'text-[#6C5CE7]' : 'text-[#636E72]'} />
                <span className="mt-2 font-medium">Circular</span>
              </div>
              <div className={`p-4 rounded-lg border-2 cursor-pointer flex flex-col items-center ${moldType === 'rectangular' ? 'border-[#6C5CE7] bg-[#EDE9FF]' : 'border-[#E8E3FF]'}`} onClick={() => setMoldType('rectangular')}>
                <Square size={32} className={moldType === 'rectangular' ? 'text-[#6C5CE7]' : 'text-[#636E72]'} />
                <span className="mt-2 font-medium">Rectangular</span>
              </div>
              <div className={`p-4 rounded-lg border-2 cursor-pointer flex flex-col items-center justify-center ${moldType === 'na' ? 'border-[#6C5CE7] bg-[#EDE9FF]' : 'border-[#E8E3FF]'}`} onClick={() => setMoldType('na')}>
                <span className={`font-bold text-lg ${moldType === 'na' ? 'text-[#6C5CE7]' : 'text-[#636E72]'}`}>N/A</span>
              </div>
            </div>
            
            {moldType === 'circular' && (
              <div>
                <label className="block text-sm font-medium text-[#636E72] mb-1">Diámetro (cm)</label>
                <input type="number" value={moldDiameter} onChange={e => setMoldDiameter(e.target.value)} className="input-marea p-2 border border-[#E8E3FF] rounded-lg w-full md:w-1/3" />
              </div>
            )}
            {moldType === 'rectangular' && (
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-[#636E72] mb-1">Ancho (cm)</label>
                  <input type="number" value={moldWidth} onChange={e => setMoldWidth(e.target.value)} className="input-marea p-2 border border-[#E8E3FF] rounded-lg w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#636E72] mb-1">Largo (cm)</label>
                  <input type="number" value={moldHeight} onChange={e => setMoldHeight(e.target.value)} className="input-marea p-2 border border-[#E8E3FF] rounded-lg w-full" />
                </div>
              </div>
            )}
            {moldType === 'na' && (
              <p className="text-sm text-[#636E72] bg-gray-50 p-3 rounded-lg">Escalado por cantidad de porciones</p>
            )}
          </div>

          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-poppins text-[#2D3436]">Ingredientes y Costos</h2>
              <p className="text-xs text-[#636E72] bg-gray-50 p-2 rounded">Costo Unit = Precio Paq / Cant. Paq</p>
            </div>
            <div className="space-y-4">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-start border-b border-gray-100 pb-4">
                  <div className="flex-1">
                    <input type="text" placeholder="Ingrediente" value={ing.name} onChange={e => { const newI = [...ingredients]; newI[idx].name = e.target.value; setIngredients(newI); }} className="w-full p-2 border rounded-lg text-sm mb-2" />
                    <div className="flex gap-2">
                      <input type="number" placeholder="Cant." value={ing.quantity} onChange={e => { const newI = [...ingredients]; newI[idx].quantity = e.target.value; setIngredients(newI); }} className="w-1/3 p-2 border rounded-lg text-sm" />
                      <input type="text" placeholder="Unidad" value={ing.unit} onChange={e => { const newI = [...ingredients]; newI[idx].unit = e.target.value; setIngredients(newI); }} className="w-1/3 p-2 border rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <input type="number" placeholder="$ Paquete" value={ing.package_cost} onChange={e => { const newI = [...ingredients]; newI[idx].package_cost = e.target.value; setIngredients(newI); }} className="w-1/2 p-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="Cant. Paquete" value={ing.package_quantity} onChange={e => { const newI = [...ingredients]; newI[idx].package_quantity = e.target.value; setIngredients(newI); }} className="w-1/2 p-2 border rounded-lg text-sm" />
                    </div>
                    <div className="text-right text-sm font-semibold text-[#6C5CE7]">
                      Subtotal: ${ ((parseFloat(ing.quantity)||0) * ((parseFloat(ing.package_cost)||0) / (parseFloat(ing.package_quantity)||1))).toFixed(2) }
                    </div>
                  </div>
                  <button onClick={() => removeIngredient(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Minus size={20} />
                  </button>
                </div>
              ))}
              <button onClick={addIngredient} className="text-[#6C5CE7] text-sm font-semibold hover:underline">+ Agregar Ingrediente</button>
            </div>
          </div>
          
          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm">
            <h2 className="text-xl font-bold font-poppins text-[#2D3436] mb-4">Instrucciones (Pasos)</h2>
            <textarea value={steps} onChange={e => setSteps(e.target.value)} className="w-full p-4 border border-[#E8E3FF] rounded-lg h-48 font-inter text-sm" placeholder="1. Precalentar horno...&#10;2. Mezclar..."></textarea>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card bg-[#FDFDFD] rounded-2xl p-6 border border-[#E8E3FF] shadow-sm sticky top-6">
            <h3 className="text-lg font-bold font-poppins text-[#2D3436] mb-4">Resumen de Precios</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-[#636E72]">Costo Ingredientes:</span>
                <span className="font-bold">${totalCost.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span className="text-[#636E72]">Margen de Ganancia:</span>
                  <span className="font-bold text-[#6C5CE7]">{margin}%</span>
                </label>
                <input 
                  type="range" 
                  min="30" 
                  max="80" 
                  value={margin} 
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-[#6C5CE7]"
                />
              </div>
              
              <div className="pt-4 border-t border-[#E8E3FF]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#2D3436]">Precio de Venta Sugerido:</span>
                  <span className="text-2xl font-bold text-[#6C5CE7]">${salePrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <input type="checkbox" id="published" className="w-4 h-4 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]" />
              <label htmlFor="published" className="text-sm font-medium text-[#2D3436]">Publicar receta inmediatamente</label>
            </div>
            
            <button onClick={() => {
              if (!name) return;
              const recipe: Recipe = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                description,
                category,
                yield_portions: parseInt(yieldPortions) || 1,
                prep_minutes: parseInt(prepMinutes) || 0,
                image_url: null as any,
                steps,
                margin_percent: margin,
                sale_price: salePrice,
                published: true,
                mold_type: moldType as any,
                mold_dimensions: moldType === 'circular' ? { diameter: parseInt(moldDiameter) || 0 } : moldType === 'rectangular' ? { width: parseInt(moldWidth) || 0, height: parseInt(moldHeight) || 0 } : {},
                items: ingredients.map(ing => ({
                  ingredient_id: Math.random().toString(),
                  ingredient_name: ing.name,
                  quantity: parseFloat(ing.quantity) || 0,
                  unit: ing.unit,
                  cost_per_unit: (parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1),
                  total_cost: (parseFloat(ing.quantity) || 0) * ((parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1))
                })),
                ai_generated: isAiMode,
                created_at: new Date().toISOString()
              };
              addRecipe(recipe);
              navigate('/recetas');
            }} className="w-full btn-primary py-3 rounded-lg bg-[#6C5CE7] text-white font-bold hover:bg-[#4834D4]">
              Guardar Receta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFormPage;
