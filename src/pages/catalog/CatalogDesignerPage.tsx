import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save, Store, Layout, FileText, ToggleLeft, Palette, Type, Image as ImageIcon, ShoppingCart, MessageCircle, Share2, QrCode, Copy, Check } from 'lucide-react';
import { CatalogPage } from './CatalogPage';
import { useToast } from '../../components/ui/ToastContext';
import { supabase } from '../../lib/supabase';
import QRCode from 'react-qr-code';

export const CatalogDesignerPage: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'apariencia' | 'productos' | 'checkout' | 'compartir'>('apariencia');
  const [copied, setCopied] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('app_settings').update({
        brand_name: settings.brand_name,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        font_heading: settings.font_heading,
        font_body: settings.font_body,
        catalog_hero_title: settings.catalog_hero_title,
        catalog_hero_subtitle: settings.catalog_hero_subtitle,
        catalog_layout: settings.catalog_layout,
        catalog_show_prep: settings.catalog_show_prep,
        catalog_show_ingredients: settings.catalog_show_ingredients,
        catalog_show_price: settings.catalog_show_price,
        catalog_show_category: settings.catalog_show_category,
        catalog_show_description: settings.catalog_show_description,
        catalog_require_phone: settings.catalog_require_phone,
        catalog_require_date: settings.catalog_require_date,
        catalog_require_address: settings.catalog_require_address,
        catalog_advance_percent: settings.catalog_advance_percent,
        catalog_max_daily_orders: settings.catalog_max_daily_orders,
        catalog_whatsapp_message: settings.catalog_whatsapp_message,
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

  const publicUrl = `https://mareadulce.com/catalogo`; // MOCK URL for demo

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Enlace copiado al portapapeles');
  };

  const toggleSwitch = (label: string, desc: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
      <div>
        <span className="block text-sm font-bold text-gray-900">{label}</span>
        <span className="block text-xs text-gray-500">{desc}</span>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 sm:-m-6 lg:-m-8 flex flex-col md:flex-row overflow-hidden bg-gray-50">
      
      {/* SIDEBAR DE TABS */}
      <div className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-20 shadow-sm">
        <button onClick={() => setActiveTab('apariencia')} className={`p-3 rounded-xl transition-all ${activeTab === 'apariencia' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} title="Apariencia">
          <Palette className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('productos')} className={`p-3 rounded-xl transition-all ${activeTab === 'productos' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} title="Productos">
          <Layout className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('checkout')} className={`p-3 rounded-xl transition-all ${activeTab === 'checkout' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} title="Checkout">
          <ShoppingCart className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('compartir')} className={`p-3 rounded-xl transition-all ${activeTab === 'compartir' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} title="Compartir">
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Controles del Diseñador (Izquierda) */}
      <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full z-10 shadow-lg">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
          <h1 className="text-xl font-bold font-poppins text-gray-900 mb-1">
            {activeTab === 'apariencia' && 'Apariencia Visual'}
            {activeTab === 'productos' && 'Visibilidad de Productos'}
            {activeTab === 'checkout' && 'Reglas de Checkout'}
            {activeTab === 'compartir' && 'Compartir Catálogo'}
          </h1>
          <p className="text-xs text-gray-500">Configura la experiencia de tus clientes.</p>
        </div>

        <div className="flex-1 p-6 space-y-8">
          
          {/* TAB 1: APARIENCIA */}
          {activeTab === 'apariencia' && (
            <>
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" /> Identidad de Marca
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                  <input type="text" value={settings.brand_name || ''} onChange={(e) => handleSettingChange('brand_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo de la Marca</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {settings.logo_url ? <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <input type="file" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.primary_color} onChange={(e) => handleSettingChange('primary_color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                      <span className="text-xs font-mono uppercase">{settings.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Fondo</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.secondary_color} onChange={(e) => handleSettingChange('secondary_color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                      <span className="text-xs font-mono uppercase">{settings.secondary_color}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-400" /> Tipografía
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Títulos</label>
                  <select value={settings.font_heading} onChange={(e) => handleSettingChange('font_heading', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="Poppins">Poppins</option>
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente de Textos</label>
                  <select value={settings.font_body} onChange={(e) => handleSettingChange('font_body', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Textos del Encabezado
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                  <input type="text" value={settings.catalog_hero_title || ''} onChange={(e) => handleSettingChange('catalog_hero_title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                  <textarea rows={3} value={settings.catalog_hero_subtitle || ''} onChange={(e) => handleSettingChange('catalog_hero_subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                </div>
              </section>
            </>
          )}

          {/* TAB 2: PRODUCTOS */}
          {activeTab === 'productos' && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                <ToggleLeft className="w-4 h-4 text-gray-400" /> Elementos Visibles
              </h3>
              
              {toggleSwitch('Mostrar Precio', 'Precio de venta al público', settings.catalog_show_price, (v) => handleSettingChange('catalog_show_price', v))}
              {toggleSwitch('Mostrar Categoría', 'Insignia de categoría', settings.catalog_show_category, (v) => handleSettingChange('catalog_show_category', v))}
              {toggleSwitch('Mostrar Descripción', 'Texto descriptivo', settings.catalog_show_description, (v) => handleSettingChange('catalog_show_description', v))}
              {toggleSwitch('Tiempo de Preparación', 'Tiempo estimado en horas/min', settings.catalog_show_prep, (v) => handleSettingChange('catalog_show_prep', v))}
              {toggleSwitch('Ingredientes Destacados', 'Lista de insumos principales', settings.catalog_show_ingredients, (v) => handleSettingChange('catalog_show_ingredients', v))}
            </section>
          )}

          {/* TAB 3: CHECKOUT */}
          {activeTab === 'checkout' && (
            <>
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Campos del Formulario (Checkout)
                </h3>
                {toggleSwitch('Teléfono Obligatorio', 'Requerido para contacto', settings.catalog_require_phone, (v) => handleSettingChange('catalog_require_phone', v))}
                {toggleSwitch('Fecha de Entrega', 'Debe seleccionar una fecha', settings.catalog_require_date, (v) => handleSettingChange('catalog_require_date', v))}
                {toggleSwitch('Dirección de Envío', 'Pedir domicilio', settings.catalog_require_address, (v) => handleSettingChange('catalog_require_address', v))}
              </section>

              <section className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Reglas de Negocio
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo Requerido (%)</label>
                  <input type="number" min="0" max="100" value={settings.catalog_advance_percent} onChange={(e) => handleSettingChange('catalog_advance_percent', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Porcentaje mínimo para confirmar el pedido.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite Diario de Pedidos</label>
                  <input type="number" min="0" value={settings.catalog_max_daily_orders} onChange={(e) => handleSettingChange('catalog_max_daily_orders', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Oculta el carrito al llegar a esta capacidad.</p>
                </div>
              </section>
            </>
          )}

          {/* TAB 4: COMPARTIR */}
          {activeTab === 'compartir' && (
            <>
              <section className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Enlace Público</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={publicUrl} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none" />
                    <button onClick={handleCopyLink} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <QrCode className="w-4 h-4" /> Código QR Oficial
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <QRCode value={publicUrl} size={150} level="H" fgColor={settings.primary_color} />
                    </div>
                    <p className="text-xs text-gray-500 text-center max-w-[200px]">Escanea para abrir el catálogo desde cualquier celular.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Plantilla de WhatsApp
                  </h3>
                  <textarea 
                    rows={6} 
                    value={settings.catalog_whatsapp_message} 
                    onChange={(e) => handleSettingChange('catalog_whatsapp_message', e.target.value)} 
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm resize-none font-mono text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  />
                  <p className="text-xs text-gray-500 mt-2">Usa las variables {'{pedido}'}, {'{total}'}, {'{anticipo}'}.</p>
                </div>
              </section>
            </>
          )}

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
      <div className="flex-1 bg-gray-200 relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="absolute top-4 z-10 pointer-events-none">
          <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm tracking-widest uppercase">
            Vista Previa (Tiempo Real)
          </span>
        </div>
        
        {/* Celular Mockup */}
        <div className="w-full max-w-[400px] aspect-[9/19] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-gray-900 relative">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-50 flex justify-center items-end pb-1">
              <div className="w-16 h-1 rounded-full bg-gray-800" />
            </div>
            
            <div className="w-full h-full pt-6 overflow-y-auto overflow-x-hidden bg-gray-50 custom-scrollbar">
               <div className="pointer-events-none select-none">
                 <CatalogPage isPreviewMode={true} />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
