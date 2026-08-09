import React, { useState } from 'react';
import { Plus, Phone, Mail, TrendingDown, Trash2, Edit2, X, Save } from 'lucide-react';
import type { Supplier, Ingredient } from '../types';
import { supabase } from '../lib/supabase';
import { useDataStore } from '../store/useDataStore';
import { useToast } from '../components/ui/ToastContext';
import { AlertDialog } from '../components/ui/AlertDialog';

type SupplierForm = {
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  category: string;
  notes: string;
};

const EMPTY_FORM: SupplierForm = {
  name: '', contact_name: '', phone: '', email: '', category: 'General', notes: '',
};

const SUPPLIER_CATEGORIES = ['Harinas y Azúcares', 'Chocolates', 'Lácteos', 'Frutas', 'Decoración', 'Empaques', 'General'];

export const SuppliersPage: React.FC = () => {
  const suppliers = useDataStore(s => s.suppliers);
  const ingredients = useDataStore(s => s.ingredients);
  const addStoreSupplier = useDataStore(s => s.addSupplier);
  const updateStoreSupplier = useDataStore(s => s.updateSupplier);
  const deleteStoreSupplier = useDataStore(s => s.deleteSupplier);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const { toast } = useToast();

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setForm({
      name: supplier.name,
      contact_name: supplier.contact_name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      category: supplier.category ?? 'General',
      notes: supplier.notes ?? '',
    });
    setEditingId(supplier.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre del proveedor es obligatorio'); return; }
    setIsSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('suppliers').update(form).eq('id', editingId);
        if (error) throw error;
        updateStoreSupplier(editingId, form);
        toast.success('Proveedor actualizado correctamente');
      } else {
        const { data, error } = await supabase.from('suppliers').insert({ ...form, created_at: new Date().toISOString() }).select().single();
        if (error) throw error;
        const created = data ?? { id: crypto.randomUUID(), ...form, created_at: new Date().toISOString() };
        addStoreSupplier(created as Supplier);
        toast.success('Proveedor creado correctamente');
      }
    } catch (err: any) {
      console.error(err);
      if (editingId) {
        updateStoreSupplier(editingId, form);
      } else {
        addStoreSupplier({ id: crypto.randomUUID(), ...form, created_at: new Date().toISOString() } as Supplier);
      }
      toast.info('Guardado localmente');
    } finally {
      setIsSaving(false);
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', deleteId);
      if (error) throw error;
      deleteStoreSupplier(deleteId);
      toast.success('Proveedor eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      deleteStoreSupplier(deleteId);
      toast.info('Eliminado localmente');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const setF = (field: keyof SupplierForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Proveedores</h1>
          <p className="page-subtitle text-gray-500">Directorio de proveedores y comparador de precios</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers?.map((supplier: Supplier) => (
          <div key={supplier.id} className="glass-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-500">{supplier.contact_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                  {supplier.category}
                </span>
                <button style={{ padding: '0.25rem', borderRadius: '0.25rem', background: '#EDE9FF', border: 'none', cursor: 'pointer', color: '#6C5CE7' }} onClick={() => openEdit(supplier)} title="Editar proveedor"><Edit2 size={13} /></button>
                <button style={{ padding: '0.25rem', borderRadius: '0.25rem', background: '#FFF5F5', border: 'none', cursor: 'pointer', color: '#E74C3C' }} onClick={() => setDeleteId(supplier.id)} title="Eliminar proveedor"><Trash2 size={13} /></button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{supplier.email}</span>
              </div>
            </div>

            {supplier.notes && (
              <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-3 mb-4">
                {supplier.notes}
              </p>
            )}

            <button className="w-full mt-auto py-2 text-primary font-medium text-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
              Ver Precios ({supplier.prices?.length || 0})
            </button>
          </div>
        ))}
      </div>

      {/* Price Comparator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-primary" />
            Comparador de Precios
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un insumo para comparar</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
            >
              <option value="">-- Seleccione un insumo --</option>
              {ingredients?.map((ing: Ingredient) => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedIngredientId ? (
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Proveedor</th>
                  <th className="p-4 font-medium">Presentación</th>
                  <th className="p-4 font-medium">Costo Paquete</th>
                  <th className="p-4 font-medium">Costo Unitario Calculado</th>
                  <th className="p-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { supp: 'Proveedor A', pack: '1 kg', cost: 120, unitCost: 0.12, best: false },
                  { supp: 'Proveedor B', pack: '5 kg', cost: 500, unitCost: 0.10, best: true },
                  { supp: 'Proveedor C', pack: '500 g', cost: 65, unitCost: 0.13, best: false },
                ].map((item, i) => (
                  <tr key={i} className={item.best ? 'bg-green-50/30' : ''}>
                    <td className="p-4 font-medium text-gray-900">{item.supp}</td>
                    <td className="p-4 text-gray-600">{item.pack}</td>
                    <td className="p-4 text-gray-600">${item.cost.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">${item.unitCost.toFixed(2)}</span>
                        {item.best && (
                          <span className="badge bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Mejor Precio</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Usar este precio</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            Selecciona un insumo arriba para ver la comparativa de precios entre proveedores.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F4F3FF' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#2D3436' }}>
                {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636E72' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Nombre del Proveedor *</label>
                <input className="input-marea" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ej: Insumos La Merced" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Contacto</label>
                  <input className="input-marea" value={form.contact_name} onChange={e => setF('contact_name', e.target.value)} placeholder="Nombre del contacto" />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Categoría</label>
                  <select className="input-marea" value={form.category} onChange={e => setF('category', e.target.value)}>
                    {SUPPLIER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Teléfono</label>
                  <input className="input-marea" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="5551234567" />
                </div>
                <div>
                  <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Correo</label>
                  <input type="email" className="input-marea" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="proveedor@email.com" />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>Notas</label>
                <textarea className="input-marea" rows={3} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Días de entrega, pedido mínimo..." style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', padding: '1.25rem 1.5rem', background: '#F8F9FA', borderTop: '1px solid #F4F3FF', borderRadius: '0 0 1.25rem 1.25rem' }}>
              <button onClick={() => setModalOpen(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {isSaving ? 'Guardando...' : <><Save size={15} /> {editingId ? 'Guardar Cambios' : 'Crear Proveedor'}</>}
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
        title="Eliminar proveedor"
        description="¿Estás seguro de eliminar este proveedor? Se perderán sus datos de contacto y catálogo de precios."
      />
    </div>
  );
};
