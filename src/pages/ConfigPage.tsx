import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Save, Image as ImageIcon, Store, Users, ShoppingBag } from 'lucide-react';

const INITIAL_NAV_ITEMS = [
  { id: 'nav-1', label: 'Dashboard', icon: Store, visible: true },
  { id: 'nav-2', label: 'Inventario', icon: ShoppingBag, visible: true },
  { id: 'nav-3', label: 'Proveedores', icon: Users, visible: true },
  { id: 'nav-4', label: 'Diseñador IA', icon: ImageIcon, visible: false },
];

export const ConfigPage: React.FC = () => {
  const [brandName, setBrandName] = useState('Marea Dulce');
  const [primaryColor, setPrimaryColor] = useState('#6C5CE7');
  const [secondaryColor, setSecondaryColor] = useState('#D6BBFB');
  const [logoUrl] = useState('');
  const [navItems, setNavItems] = useState(INITIAL_NAV_ITEMS);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(navItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setNavItems(items);
  };

  const toggleVisibility = (id: string) => {
    setNavItems(navItems.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Configuración de Marca</h1>
        <p className="page-subtitle text-gray-500">Personaliza la apariencia y navegación de tu plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BRAND SECTION */}
        <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-poppins text-gray-900">Identidad Visual</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Marca</label>
              <input 
                type="text" 
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo de la Marca</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer" />
                  <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono" />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Vista previa</p>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md" style={{ backgroundColor: primaryColor }}>
                  {brandName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-gray-900 leading-tight">{brandName}</h3>
                  <p className="text-xs text-gray-500" style={{ color: secondaryColor }}>SaaS Platform</p>
                </div>
              </div>
            </div>

            <button className="w-full btn-primary bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* SIDEBAR SECTION */}
        <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-poppins text-gray-900">Personalizar Navegación</h2>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">Arrastra los elementos para cambiar su orden en el menú lateral. Oculta los módulos que no utilices.</p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sidebar-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              snapshot.isDragging ? 'bg-primary/5 border-primary shadow-lg scale-105' : 'bg-white border-gray-200'
                            } transition-transform`}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className={`flex items-center gap-3 ${!item.visible ? 'opacity-50' : ''}`}>
                                <Icon className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-700">{item.label}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleVisibility(item.id)}
                              className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                            >
                              {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <button className="w-full mt-6 btn-primary bg-gray-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <Save className="w-4 h-4" />
            Guardar Orden
          </button>
        </div>
      </div>
    </div>
  );
};
