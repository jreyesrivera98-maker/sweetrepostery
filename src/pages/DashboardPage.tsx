import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag, DollarSign, BookOpen, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { useDataStore } from '../store/useDataStore';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const orders = useDataStore(s => s.orders);
  const recipes = useDataStore(s => s.recipes);
  const ingredients = useDataStore(s => s.ingredients);

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es });

  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'ready').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const lowStockCount = ingredients.filter(i => i.stock <= i.min_stock).length;

  const mockRevenueData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const dateStr = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    };
  });


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const upcomingDeliveries = [...orders]
    .sort((a, b) => new Date(a.delivery_date ?? '').getTime() - new Date(b.delivery_date ?? '').getTime())
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending': return 'status-pending badge badge-warning';
      case 'production': return 'status-production badge badge-info';
      case 'ready': return 'status-ready badge badge-primary';
      case 'delivered': return 'status-delivered badge badge-success';
      case 'cancelled': return 'status-cancelled badge badge-danger';
      default: return 'badge';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'production': 'En Producción',
      'ready': 'Listo',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#F4F3FF] min-h-screen">
      <header className="page-header mb-8">
        <h1 className="page-title text-3xl font-bold text-[#2D3436] font-poppins">Dashboard</h1>
        <p className="page-subtitle text-[#636E72] capitalize font-inter mt-1">{currentDate}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pedidos Activos"
          value={activeOrdersCount}
          icon={ShoppingBag}
          trend={12.5}
          trendLabel="vs mes anterior"
          onClick={() => navigate('/pedidos')}
          color="#6C5CE7"
        />
        <KPICard
          title="Facturado este mes"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend={8.2}
          trendLabel="vs mes anterior"
          onClick={() => navigate('/pedidos/bitacora')}
          color="#4834D4"
        />
        <KPICard
          title="Recetas Totales"
          value={recipes.length}
          icon={BookOpen}
          trend={3.1}
          trendLabel="nuevas este mes"
          onClick={() => navigate('/recetas')}
          color="#D6BBFB"
        />
        <KPICard
          title="Stock Bajo"
          value={lowStockCount}
          icon={AlertTriangle}
          trend={-5.0}
          trendLabel="items críticos"
          onClick={() => navigate('/inventario?filter=low_stock')}
          color="#FF7675"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card bg-[#FDFDFD] p-6 rounded-[1rem] shadow-sm border border-[#E8E3FF]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2D3436] font-poppins">Ingresos y Pedidos</h2>
          </div>
          <RevenueChart data={mockRevenueData} />
        </div>

        <div className="glass-card bg-[#FDFDFD] p-6 rounded-[1rem] shadow-sm border border-[#E8E3FF]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2D3436] font-poppins">Próximas Entregas</h2>
          </div>
          <div className="space-y-4">
            {upcomingDeliveries.map((order) => (
              <div key={order.id} className="flex items-center p-3 rounded-xl hover:bg-[#F4F3FF] transition-colors cursor-pointer border border-transparent hover:border-[#E8E3FF]">
                <div className="p-3 bg-[#EDE9FF] rounded-lg text-[#6C5CE7] mr-4">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#2D3436] font-inter">{order.customer_name}</h4>
                  <p className="text-sm text-[#636E72] font-inter">{order.delivery_date ? format(new Date(order.delivery_date), "MMM d, h:mm a") : '—'}</p>
                </div>
                <ChevronRight size={16} className="text-[#636E72]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card bg-[#FDFDFD] rounded-[1rem] shadow-sm border border-[#E8E3FF] overflow-hidden">
        <div className="p-6 border-b border-[#E8E3FF] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#2D3436] font-poppins">Órdenes Recientes</h2>
          <button 
            onClick={() => navigate('/pedidos')}
            className="text-sm font-medium text-[#6C5CE7] hover:text-[#4834D4] flex items-center font-inter transition"
          >
            Ver todas <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="marea-table w-full text-left border-collapse font-inter">
            <thead>
              <tr className="bg-[#F4F3FF] text-[#636E72] text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">ID Pedido</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Fecha Entrega</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3FF]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F4F3FF] transition-colors">
                  <td className="p-4 font-medium text-[#2D3436]">{order.id}</td>
                  <td className="p-4 text-[#2D3436]">{order.customer_name}</td>
                  <td className="p-4 text-[#636E72]">
                    {order.delivery_date ? format(new Date(order.delivery_date), "MMM d, yyyy") : '—'}
                  </td>
                  <td className="p-4 font-medium text-[#2D3436]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium status-pill ${getStatusBadgeClass(order.status)}`}>
                      {translateStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
