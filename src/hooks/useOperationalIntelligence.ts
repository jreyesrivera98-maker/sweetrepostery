import { useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import { isTomorrow, startOfDay, subDays } from 'date-fns';

export type Recommendation = {
  id: string;
  type: 'production' | 'sales' | 'inventory' | 'customer';
  title: string;
  problem: string;
  evidence: string;
  action: string;
  impact: string;
};

export function useOperationalIntelligence() {
  const orders = useDataStore((s) => s.orders);
  const recipes = useDataStore((s) => s.recipes);
  const ingredients = useDataStore((s) => s.ingredients);

  return useMemo(() => {
    const today = startOfDay(new Date());

    // 1. Production Intelligence (Carga y Riesgo)
    const activeOrders = orders.filter(
      (o) => o.status === 'pending' || o.status === 'production'
    );
    
    const ordersForTomorrow = activeOrders.filter((o) =>
      o.delivery_date ? isTomorrow(new Date(o.delivery_date)) : false
    );
    
    // Calcular capacidad histórica (promedio de entregas por día en los últimos 30 días)
    const thirtyDaysAgo = subDays(today, 30);
    const last30DaysOrders = orders.filter(
      (o) => o.delivery_date && new Date(o.delivery_date) >= thirtyDaysAgo
    );
    const historicalCapacity = Math.max(Math.round(last30DaysOrders.length / 30), 1);
    
    // Determinar Riesgo
    const tomorrowLoad = ordersForTomorrow.length;
    let productionRisk: 'Bajo' | 'Medio' | 'Alto' = 'Bajo';
    if (tomorrowLoad > historicalCapacity * 1.5) productionRisk = 'Alto';
    else if (tomorrowLoad > historicalCapacity) productionRisk = 'Medio';

    const productionInsight = {
      tomorrowLoad,
      historicalCapacity,
      risk: productionRisk,
    };

    // 2. Recommendations Engine
    const recommendations: Recommendation[] = [];

    // Recomendación de Producción
    if (productionRisk === 'Alto') {
      recommendations.push({
        id: 'rec-prod-1',
        type: 'production',
        title: 'Riesgo de Retraso de Producción',
        problem: 'Capacidad operativa excedida para mañana.',
        evidence: `Tienes ${tomorrowLoad} pedidos programados para entregar mañana. Tu capacidad promedio es de ${historicalCapacity} diarios.`,
        action: 'Sugerimos adelantar la preparación de bizcochos hoy o asignar turnos extra.',
        impact: 'Prevenir retrasos y mantener calidad al 100%.',
      });
    }

    // Análisis de Ventas (Producto Estrella)
    const recipeSales = recipes.map((recipe) => {
      let sold = 0;
      let revenue = 0;
      orders.forEach((o) => {
        if (o.status !== 'cancelled') {
          o.items.forEach((item) => {
            if (item.recipe_id === recipe.id) {
              sold += item.quantity;
              revenue += item.total;
            }
          });
        }
      });
      return { recipe, sold, revenue };
    });

    const topProduct = [...recipeSales].sort((a, b) => b.sold - a.sold)[0];
    if (topProduct && topProduct.sold > 0) {
      recommendations.push({
        id: 'rec-sales-1',
        type: 'sales',
        title: 'Potencial de Ventas',
        problem: 'Oportunidad de maximizar ingresos.',
        evidence: `El producto "${topProduct.recipe.name}" ha generado $${topProduct.revenue.toLocaleString('es-MX')} en ventas históricas, siendo el más popular.`,
        action: 'Lanzar una promoción en Instagram para este producto o crear un paquete.',
        impact: 'Aumento proyectado del 15% en el ticket promedio.',
      });
    }

    // Análisis de Inventario
    const lowStockItems = ingredients.filter((i) => i.stock <= i.min_stock);
    if (lowStockItems.length > 0) {
      recommendations.push({
        id: 'rec-inv-1',
        type: 'inventory',
        title: 'Ruptura de Stock Inminente',
        problem: 'Insumos críticos por debajo del mínimo.',
        evidence: `${lowStockItems.length} insumos (Ej. ${lowStockItems[0].name}) están en nivel crítico.`,
        action: 'Realizar pedido urgente a proveedores.',
        impact: 'Evitar paros en producción de pedidos activos.',
      });
    }

    return {
      productionInsight,
      recommendations,
    };
  }, [orders, recipes, ingredients]);
}
