import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Circle, Square, Minus, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { MareaRecipeAi } from '../../components/recipes/MareaRecipeAi';
import { useDataStore } from '../../store/useDataStore';
import type { Recipe } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

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

  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const handleSave = () => {
    if (!name) return;
    const recipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name, description, category,
      yield_portions: parseInt(yieldPortions) || 1,
      prep_minutes: parseInt(prepMinutes) || 0,
      image_url: null as any, steps, margin_percent: margin, sale_price: salePrice, published: true,
      mold_type: moldType as any,
      mold_dimensions: moldType === 'circular' ? { diameter: parseInt(moldDiameter) || 0 } : moldType === 'rectangular' ? { width: parseInt(moldWidth) || 0, height: parseInt(moldHeight) || 0 } : {},
      items: ingredients.map(ing => ({
        ingredient_id: Math.random().toString(),
        ingredient_name: ing.name,
        quantity: parseFloat(ing.quantity) || 0, unit: ing.unit,
        cost_per_unit: (parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1),
        total_cost: (parseFloat(ing.quantity) || 0) * ((parseFloat(ing.package_cost) || 0) / (parseFloat(ing.package_quantity) || 1))
      })),
      ai_generated: isAiMode,
      created_at: new Date().toISOString()
    };
    addRecipe(recipe);
    navigate('/recetas');
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <PageHeader 
        title={isAiMode ? "Asistente IA de Recetas" : "Nueva Receta"}
        primaryAction={<Button onClick={handleSave} leftIcon={<Save size={18} />}>Guardar Receta</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isAiMode && (
            <MareaRecipeAi onRecipeGenerated={handleAiGenerated} />
          )}

          <Card className="p-6">
            <h2 className="text-lg font-poppins font-bold text-text mb-4">Información General</h2>
            <div className="space-y-4">
              <Input label="Nombre de la Receta *" required value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Torta de Chocolate" />
              <Textarea label="Descripción" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Breve descripción del producto..." />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select 
                  label="Categoría" 
                  value={category} 
                  onChange={e => setCategory(e.target.value as any)}
                  options={[{ label: 'Seleccionar...', value: '' }, { label: 'Tortas', value: 'Tortas' }, { label: 'Postres', value: 'Postres' }]}
                />
                <Input label="Porciones" type="number" value={yieldPortions} onChange={e => setYieldPortions(e.target.value)} />
                <Input label="Tiempo (min)" type="number" value={prepMinutes} onChange={e => setPrepMinutes(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-poppins font-bold text-text">Ingredientes y Costos</h2>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">Costo Unit = $ Paquete / Cant. Paq</span>
            </div>
            
            <div className="space-y-4">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-border relative group">
                  <button onClick={() => removeIngredient(idx)} className="absolute -top-2 -right-2 bg-white border border-danger text-danger p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Minus size={14} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <Input placeholder="Ingrediente" value={ing.name} onChange={e => { const newI = [...ingredients]; newI[idx].name = e.target.value; setIngredients(newI); }} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="number" placeholder="Cant." value={ing.quantity} onChange={e => { const newI = [...ingredients]; newI[idx].quantity = e.target.value; setIngredients(newI); }} />
                    </div>
                    <div className="md:col-span-2">
                      <Input placeholder="Unidad" value={ing.unit} onChange={e => { const newI = [...ingredients]; newI[idx].unit = e.target.value; setIngredients(newI); }} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="number" placeholder="$ Paq." value={ing.package_cost} onChange={e => { const newI = [...ingredients]; newI[idx].package_cost = e.target.value; setIngredients(newI); }} />
                    </div>
                    <div className="md:col-span-2">
                      <Input type="number" placeholder="Cant. Paq." value={ing.package_quantity} onChange={e => { const newI = [...ingredients]; newI[idx].package_quantity = e.target.value; setIngredients(newI); }} />
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold text-primary mt-2">
                    Subtotal: ${ ((parseFloat(ing.quantity)||0) * ((parseFloat(ing.package_cost)||0) / (parseFloat(ing.package_quantity)||1))).toFixed(2) }
                  </div>
                </div>
              ))}
              <Button variant="ghost" onClick={addIngredient} size="sm">
                + Agregar Ingrediente
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-poppins font-bold text-text mb-4">Instrucciones (Pasos)</h2>
            <Textarea value={steps} onChange={e => setSteps(e.target.value)} rows={6} placeholder="1. Precalentar horno a 180°C...&#10;2. Mezclar secos..." />
          </Card>
          
          {/* Opciones Avanzadas (Progressive Disclosure) */}
          <div className="mt-8">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              <Settings2 size={16} /> 
              {showAdvanced ? 'Ocultar Opciones Avanzadas' : 'Mostrar Opciones Avanzadas'}
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-6 animate-[slideUp_0.3s_ease]">
                <Card className="p-6 border-secondary">
                  <h2 className="text-lg font-poppins font-bold text-text mb-4">Configuración del Molde</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center transition-all ${moldType === 'circular' ? 'border-primary bg-secondary-light/50' : 'border-border hover:border-secondary'}`} onClick={() => setMoldType('circular')}>
                      <Circle size={28} className={moldType === 'circular' ? 'text-primary' : 'text-muted'} />
                      <span className="mt-2 text-sm font-medium">Circular</span>
                    </div>
                    <div className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center transition-all ${moldType === 'rectangular' ? 'border-primary bg-secondary-light/50' : 'border-border hover:border-secondary'}`} onClick={() => setMoldType('rectangular')}>
                      <Square size={28} className={moldType === 'rectangular' ? 'text-primary' : 'text-muted'} />
                      <span className="mt-2 text-sm font-medium">Rectangular</span>
                    </div>
                    <div className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${moldType === 'na' ? 'border-primary bg-secondary-light/50' : 'border-border hover:border-secondary'}`} onClick={() => setMoldType('na')}>
                      <span className={`font-bold ${moldType === 'na' ? 'text-primary' : 'text-muted'}`}>N/A</span>
                      <span className="mt-2 text-sm font-medium text-muted">A granel</span>
                    </div>
                  </div>
                  
                  {moldType === 'circular' && (
                    <Input label="Diámetro (cm)" type="number" value={moldDiameter} onChange={e => setMoldDiameter(e.target.value)} className="w-1/3" />
                  )}
                  {moldType === 'rectangular' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Ancho (cm)" type="number" value={moldWidth} onChange={e => setMoldWidth(e.target.value)} />
                      <Input label="Largo (cm)" type="number" value={moldHeight} onChange={e => setMoldHeight(e.target.value)} />
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 bg-gradient-to-b from-white to-bg border-secondary/20">
            <h3 className="text-lg font-bold font-poppins text-text mb-6">Fijación de Precio</h3>
            
            <div className="space-y-6 mb-6">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-border">
                <span className="text-sm font-medium text-muted">Costo Insumos:</span>
                <span className="font-bold text-text">${totalCost.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-muted">Margen de Ganancia:</span>
                  <span className="font-bold text-primary bg-primary/10 px-2 rounded">{margin}%</span>
                </label>
                <input 
                  type="range" min="30" max="80" 
                  value={margin} onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>30%</span><span>55%</span><span>80%</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <div className="flex flex-col gap-1 items-center justify-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <span className="font-medium text-sm text-primary-dark">Precio de Venta Sugerido</span>
                  <span className="text-3xl font-bold text-primary">${salePrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSave} variant="primary" fullWidth size="lg" className="shadow-lg shadow-primary/30">
              Guardar Receta
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeFormPage;
