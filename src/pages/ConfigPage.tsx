import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Save, Image as ImageIcon, Store, Users, LayoutDashboard, BookOpen, Calculator, Wand2, ClipboardList, Package, Truck, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/ToastContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, BookOpen, Calculator, Wand2, ClipboardList, Users,
  Package, Truck, Store, BarChart3, Settings: SettingsIcon,
};

export const ConfigPage: React.FC = () => {
  const { settings, reorderSidebar, toggleSidebarItem } = useAppStore();
  const { toast } = useToast();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(settings.sidebar_navigation_order);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderSidebar(items);
    
    try {
      const { error } = await supabase.from('app_settings').update({ sidebar_navigation_order: items }).eq('id', settings.id);
      if (error) throw error;
      toast.success('Orden guardado correctamente');
    } catch (e: any) {
      console.error(e);
      toast.info('Actualizado localmente (modo mock)');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    toggleSidebarItem(id);
    const updatedItems = settings.sidebar_navigation_order.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    try {
      await supabase.from('app_settings').update({ sidebar_navigation_order: updatedItems }).eq('id', settings.id);
    } catch (e: any) {
      console.error(e);
    }
  };



  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Configuración de Marca</h1>
        <p className="page-subtitle text-gray-500">Personaliza la apariencia y navegación de tu plataforma</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
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
                  {settings.sidebar_navigation_order.map((item, index) => {
                    const Icon = ICON_MAP[item.icon] || Store;
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
                              onClick={() => handleToggleVisibility(item.id)}
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
        </div>
      </div>
    </div>
  );
};
