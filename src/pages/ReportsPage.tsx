import React from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Download, Calendar, TrendingUp, CreditCard } from 'lucide-react';

const revenueData = [
  { name: 'Ene', total: 4000 },
  { name: 'Feb', total: 3000 },
  { name: 'Mar', total: 5000 },
  { name: 'Abr', total: 4500 },
  { name: 'May', total: 6000 },
  { name: 'Jun', total: 5500 },
];

const topProductsData = [
  { name: 'Pastel Zanahoria', sales: 120 },
  { name: 'Cheesecake Frutos', sales: 98 },
  { name: 'Red Velvet', sales: 86 },
  { name: 'Brownies', sales: 75 },
  { name: 'Tarta Manzana', sales: 60 },
];

const channelData = [
  { name: 'Sitio Web', value: 400 },
  { name: 'WhatsApp', value: 300 },
  { name: 'Instagram', value: 300 },
  { name: 'Mostrador', value: 200 },
];

const COLORS = ['#6C5CE7', '#D6BBFB', '#A29BFE', '#81ECEC'];

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold font-poppins text-gray-900">Reportes Financieros</h1>
          <p className="page-subtitle text-gray-500">Métricas clave, ventas y enlaces de pago</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <select className="bg-transparent outline-none">
              <option>Últimos 6 meses</option>
              <option>Este mes</option>
              <option>Año actual</option>
            </select>
          </div>
          <button className="btn-ghost flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi-card p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <p className="text-sm font-medium text-gray-500">Total Facturado</p>
            <div className="p-2 bg-primary/10 text-primary rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 z-10">$28,000</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        <div className="kpi-card p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <p className="text-sm font-medium text-gray-500">Costo Total</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingUp className="w-5 h-5 rotate-180" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 z-10">$12,400</p>
        </div>
        <div className="kpi-card p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <p className="text-sm font-medium text-gray-500">Utilidad Bruta</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900 z-10">$15,600</p>
        </div>
        <div className="kpi-card p-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex justify-between items-start z-10">
            <p className="text-sm font-medium text-primary-100">Margen Promedio</p>
            <div className="p-2 bg-white/20 rounded-lg"><TrendingUp className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-3xl font-bold z-10">55.7%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold font-poppins text-gray-900 mb-6">Ingresos a través del tiempo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{stroke: '#D6BBFB', strokeWidth: 2}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="total" stroke="#6C5CE7" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Link Generator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-poppins text-gray-900">Generador de Pagos</h3>
              <p className="text-sm text-gray-500">Crea enlaces de cobro rápido</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a cobrar (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto (Opcional)</label>
              <input type="text" placeholder="Ej: Anticipo Pastel Boda" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" />
            </div>
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button className="py-3 px-4 bg-[#635BFF] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#524be0] transition-colors shadow-sm">
                Stripe Link
              </button>
              <button className="py-3 px-4 bg-[#009EE3] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#0089c7] transition-colors shadow-sm">
                MercadoPago
              </button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold font-poppins text-gray-900 mb-6">Top 5 Recetas más vendidas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12}} width={120} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px'}} />
                <Bar dataKey="sales" fill="#6C5CE7" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold font-poppins text-gray-900 mb-6">Ventas por Canal</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm font-medium text-gray-500">1,200 Ventas</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {channelData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
