import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertCircle, Package, X, Save } from 'lucide-react';
import { mockIngredients } from '../lib/mockData';
import type { Ingredient } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastContext';
import { AlertDialog } from '../components/ui/AlertDialog';

type IngredientForm = {
  name: string;
  category: string;
  unit: string;
  package_cost: number;
  package_quantity: number;
  stock: number;
  min_stock: number;
};

const EMPTY_FORM: IngredientForm = {
  name: '',
  category: 'General',
  unit: 'g',
  package_cost: 0,
  package_quantity: 1,
  stock: 0,
  min_stock: 0,
};

const CATEGORIES = ['Harinas', 'Azúcares', 'Lácteos', 'Chocolates', 'Frutas', 'Decoración', 'Grasas', 'General'];
const UNITS = ['g', 'kg', 'ml', 'L', 'pza', 'taza', 'cdta'];

export const InventoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<IngredientForm>(EMPTY_FORM);
  const { toast } = useToast();

  const filter = searchParams.get('filter');

  const filteredIngredients = useMemo(() => {
    let result = ingredients;
    if (filter === 'low_stock') {
      result = result.filter(ing => ing.stock < ing.min_stock);
    }
    if (search) {
      result = result.filter(ing => ing.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [ingredients, filter, search]);

  const totalIngredients = ingredients.length;
  const lowStockCount = ingredients.filter(ing => ing.stock < ing.min_stock && ing.stock > 0).length;
  const outOfStockCount = ingredients.filter(ing => ing.stock === 0).length;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (ing: Ingredient) => {
    setForm({
      name: ing.name,
      category: ing.category || '',
      unit: ing.unit,
      package_cost: ing.package_cost,
      package_quantity: ing.package_quantity,
      stock: ing.stock,
      min_stock: ing.min_stock,
    });
    setEditingId(ing.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre del insumo es obligatorio'); return; }
    setIsSaving(true);
    const costPerUnit = form.package_cost / (form.package_quantity || 1);
    try {
      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('ingredients').update({
          name: form.name, category: form.category, unit: form.unit,
          package_cost: form.package_cost, package_quantity: form.package_quantity,
          cost_per_unit: costPerUnit, stock: form.stock, min_stock: form.min_stock,
        }).eq('id', editingId);
        if (error) throw error;
        setIngredients(prev => prev.map(ing => ing.id === editingId
          ? { ...ing, ...form, cost_per_unit: costPerUnit } : ing));
        toast.success('Insumo actualizado correctamente');
      } else {
        // CREATE
        const newIng: Omit<Ingredient, 'id'> = {
          ...form, cost_per_unit: costPerUnit, created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('ingredients').insert(newIng).select().single();
        if (error) throw error;
        const created = data ?? { id: crypto.randomUUID(), ...newIng };
        setIngredients(prev => [...prev, created as Ingredient]);
        toast.success('Insumo creado correctamente');
      }
    } catch (err: any) {
      console.error(err);
      if (editingId) {
        setIngredients(prev => prev.map(ing => ing.id === editingId
          ? { ...ing, ...form, cost_per_unit: costPerUnit } : ing));
      } else {
        const localId = crypto.randomUUID();
        setIngredients(prev => [...prev, { id: localId, ...form, cost_per_unit: costPerUnit, created_at: new Date().toISOString() }]);
      }
      toast.info('Guardado localmente (modo mock)');
    } finally {
      setIsSaving(false);
      setModalOpen(false);
    }
  };

  const handleUpdateIngredient = async (id: string, field: string, value: number) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const updated = { ...ing, [field]: value };
        if (field === 'package_cost' || field === 'package_quantity') {
          updated.cost_per_unit = updated.package_cost / (updated.package_quantity || 1);
        }
        return updated;
      }
      return ing;
    }));
    try {
      const { error } = await supabase.from('ingredients').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('ingredients').delete().eq('id', deleteId);
      if (error) throw error;
      setIngredients(prev => prev.filter(ing => ing.id !== deleteId));
      toast.success('Registro eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      setIngredients(prev => prev.filter(ing => ing.id !== deleteId));
      toast.info('Eliminado localmente (modo mock)');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const setF = (field: keyof IngredientForm, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario de Insumos</h1>
          <p className="page-subtitle">Gestiona tus ingredientes y controla el stock</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Insumo</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#EDE9FF', borderRadius: '0.75rem' }}><Package size={22} style={{ color: '#6C5CE7' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Total Insumos</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>{totalIngredients}</div>
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderColor: filter === 'low_stock' ? '#F4C430' : undefined }}
          onClick={() => setSearchParams(filter === 'low_stock' ? {} : { filter: 'low_stock' })}
        >
          <div style={{ padding: '0.75rem', background: '#FFF8E1', borderRadius: '0.75rem' }}><AlertCircle size={22} style={{ color: '#F4C430' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Stock Bajo</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E67E22' }}>{lowStockCount}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#FFF5F5', borderRadius: '0.75rem' }}><AlertCircle size={22} style={{ color: '#E74C3C' }} /></div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>Agotados</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E74C3C' }}>{outOfStockCount}</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#EDE9FF', border: '1px solid #D6BBFB', borderRadius: '0.625rem', padding: '0.625rem 1rem', marginBottom: '1rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#4834D4', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        📐 Costo Unitario = Precio Paquete ÷ Cantidad Paquete
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '350px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
        <input className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Buscar insumo..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="marea-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Precio Paquete ($)</th>
              <th>Cant. Paquete</th>
              <th style={{ background: '#EDE9FF', color: '#6C5CE7' }}>Costo/Unidad</th>
              <th>Stock Actual</th>
              <th>Stock Mín.</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map(ing => (
              <tr key={ing.id} className={ing.stock < ing.min_stock ? 'low-stock-row' : ''}>
                <td>
                  <div style={{ fontWeight: 600 }}>{ing.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{ing.category}</span>
                    <span style={{ fontSize: '0.72rem', color: '#636E72' }}>{ing.unit}</span>
                  </div>
                </td>
                <td>
                  <input type="number" value={ing.package_cost || 0} onChange={e => handleUpdateIngredient(ing.id, 'package_cost', Number(e.target.value))} className="input-marea" style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input type="number" value={ing.package_quantity || 1} onChange={e => handleUpdateIngredient(ing.id, 'package_quantity', Number(e.target.value))} className="input-marea" style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} />
                    <span style={{ fontSize: '0.72rem', color: '#636E72' }}>{ing.unit}</span>
                  </div>
                </td>
                <td style={{ background: '#F4F3FF', fontWeight: 700, color: '#6C5CE7' }}>
                  ${(ing.package_cost / (ing.package_quantity || 1)).toFixed(4)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <input type="number" value={ing.stock} onChange={e => handleUpdateIngredient(ing.id, 'stock', Number(e.target.value))} className="input-marea" style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: ing.stock < ing.min_stock ? '#FEB2B2' : undefined, color: ing.stock < ing.min_stock ? '#C53030' : undefined }} />
                    {ing.stock < ing.min_stock && <AlertCircle size={14} style={{ color: '#E74C3C' }} />}
                  </div>
                </td>
                <td style={{ color: '#636E72', fontSize: '0.875rem' }}>{ing.min_stock} {ing.unit}</td>
                <td>
                  {ing.stock === 0 ? (
                    <span className="badge badge-danger">Agotado</span>
                  ) : ing.stock <= ing.min_stock ? (
                    <span className="badge badge-warning">Stock Bajo</span>
                  ) : (
                    <span className="badge badge-success">Óptimo</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#EDE9FF', border: 'none', cursor: 'pointer', color: '#6C5CE7' }} onClick={() => openEdit(ing)} title="Editar insumo"><Edit2 size={13} /></button>
                    <button style={{ padding: '0.375rem', borderRadius: '0.375rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C' }} onClick={() => setDeleteId(ing.id)} title="Eliminar insumo"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredIngredients.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#636E72' }}>No se encontraron insumos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F4F3FF' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436' }}>
                {editingId ? 'Editar Insumo' : 'Nuevo Insumo'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636E72' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Nombre del Insumo *</label>
                <input className="input-marea" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ej: Harina de Trigo" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Categoría</label>
                  <select className="input-marea" value={form.category} onChange={e => setF('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Unidad de medida</label>
                  <select className="input-marea" value={form.unit} onChange={e => setF('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Precio del Paquete ($)</label>
                  <input type="number" min={0} step={0.01} className="input-marea" value={form.package_cost} onChange={e => setF('package_cost', Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Cantidad del Paquete</label>
                  <input type="number" min={1} className="input-marea" value={form.package_quantity} onChange={e => setF('package_quantity', Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Stock Actual</label>
                  <input type="number" min={0} className="input-marea" value={form.stock} onChange={e => setF('stock', Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Stock Mínimo</label>
                  <input type="number" min={0} className="input-marea" value={form.min_stock} onChange={e => setF('min_stock', Number(e.target.value))} />
                </div>
              </div>

              {form.package_quantity > 0 && (
                <div style={{ background: '#EDE9FF', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#4834D4' }}>
                  📐 Costo por unidad: ${(form.package_cost / form.package_quantity).toFixed(4)} / {form.unit}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', padding: '1.25rem 1.5rem', background: '#F8F9FA', borderTop: '1px solid #F4F3FF', borderRadius: '0 0 1.25rem 1.25rem' }}>
              <button onClick={() => setModalOpen(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {isSaving ? 'Guardando...' : <><Save size={15} /> {editingId ? 'Guardar Cambios' : 'Crear Insumo'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar insumo"
        description="¿Estás seguro de eliminar este insumo? Esta acción no se puede deshacer y afectará el cálculo de recetas que lo utilicen."
      />
    </div>
  );
};
