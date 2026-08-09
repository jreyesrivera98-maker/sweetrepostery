import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save, Store, Palette, Layout, FileText, ToggleLeft } from 'lucide-react';
import { CatalogPage } from './CatalogPage';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';

export const CatalogDesignerPage: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('app_settings').update({
        catalog_hero_title: settings.catalog_hero_title,
        catalog_hero_subtitle: settings.catalog_hero_subtitle,
        catalog_layout: settings.catalog_layout,
        catalog_show_prep: settings.catalog_show_prep,
        catalog_show_ingredients: settings.catalog_show_ingredients,
      }).eq('id', settings.id);
      
      if (error) throw error;
      toast.success('Diseño de catálogo guardado correctamente');
    } catch (e) {
      console.error(e);
      toast.info('Cambios guardados localmente');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 sm:-m-6 lg:-m-8 flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Controles del Diseñador (Izquierda) */}
      <div className="w-full md:w-1/3 max-w-md bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full shadow-lg z-10">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold font-poppins text-gray-900">Diseñador de Catálogo</h1>
          </div>
          <p className="text-sm text-gray-500">Personaliza la experiencia pública de tus clientes.</p>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Textos Principales */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Textos del Encabezado
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
              <input
                type="text"
                value={settings.catalog_hero_title || ''}
                onChange={(e) => handleSettingChange('catalog_hero_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <textarea
                rows={2}
                value={settings.catalog_hero_subtitle || ''}
                onChange={(e) => handleSettingChange('catalog_hero_subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
              />
            </div>
          </section>

          {/* Opciones de Visualización */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-400" /> Estructura (Layout)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSettingChange('catalog_layout', 'grid')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  settings.catalog_layout === 'grid'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-full h-12 bg-gray-100 rounded grid grid-cols-2 gap-1 p-1">
                  <div className="bg-white rounded shadow-sm" />
                  <div className="bg-white rounded shadow-sm" />
                </div>
                <span className="text-sm font-medium text-gray-900">Cuadrícula (Tarjetas)</span>
              </button>
            </div>
          </section>

          {/* Información Adicional */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ToggleLeft className="w-4 h-4 text-gray-400" /> Información Extra
            </h3>
            
            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <span className="block text-sm font-bold text-gray-900">Tiempo de Preparación</span>
                <span className="block text-xs text-gray-500">Mostrar tiempo estimado al cliente</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.catalog_show_prep ? 'bg-primary' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.catalog_show_prep ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={settings.catalog_show_prep}
                onChange={(e) => handleSettingChange('catalog_show_prep', e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <span className="block text-sm font-bold text-gray-900">Ingredientes Destacados</span>
                <span className="block text-xs text-gray-500">Útil para alertar sobre alergias</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.catalog_show_ingredients ? 'bg-primary' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.catalog_show_ingredients ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={settings.catalog_show_ingredients}
                onChange={(e) => handleSettingChange('catalog_show_ingredients', e.target.checked)}
              />
            </label>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-20">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl shadow-lg"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar y Publicar'}
          </button>
        </div>
      </div>

      {/* Vista Previa Interactiva (Derecha) */}
      <div className="flex-1 bg-gray-200 relative overflow-hidden flex flex-col">
        <div className="absolute top-4 left-0 right-0 text-center z-10 pointer-events-none">
          <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm tracking-widest uppercase">
            Vista Previa en Vivo
          </span>
        </div>
        <div className="flex-1 overflow-hidden p-4 md:p-8 flex justify-center">
          <div className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800 relative">
             <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center px-4 gap-2 z-50">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
               <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
               <div className="flex-1 text-center text-[10px] text-gray-400 font-mono">marea-dulce.com/catalogo</div>
             </div>
             {/* Escalar la vista previa para que quepa mejor en el contenedor */}
             <div className="w-full h-full pt-6 overflow-y-auto overflow-x-hidden origin-top relative bg-gray-50 custom-scrollbar">
                {/* 
                  Renderizamos CatalogPage directamente. 
                  Como CatalogPage usará el estado global de useAppStore, 
                  los cambios se verán inmediatamente.
                */}
                <div className="pointer-events-none select-none">
                   <CatalogPage isPreviewMode={true} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
