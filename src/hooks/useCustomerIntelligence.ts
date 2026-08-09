import { useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import { differenceInDays, startOfDay } from 'date-fns';

export type CustomerIntelligence = {
  ltv: number;
  frequency: number;
  averageTicket: number;
  segment: 'Frecuente' | 'Nuevo' | 'En Riesgo' | 'Inactivo';
  lastPurchaseDate: Date | null;
  favoriteRecipeId?: string;
};

export function useCustomerIntelligence() {
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);

  return useMemo(() => {
    const intelligenceMap: Record<string, CustomerIntelligence> = {};

    customers.forEach(customer => {
      const customerOrders = orders.filter(
        (o) => o.customer_name === customer.name && o.status !== 'cancelled' // Orders rely on customer_name right now in mock data
      );

      if (customerOrders.length === 0) {
        intelligenceMap[customer.id] = {
          ltv: 0,
          frequency: 0,
          averageTicket: 0,
          segment: 'Nuevo',
          lastPurchaseDate: null,
        };
        return; // next customer
      }

      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      const frequency = customerOrders.length;
      const averageTicket = totalSpent / frequency;

      // Last purchase date
      const sortedDates = customerOrders
        .map(o => new Date(o.created_at))
        .sort((a, b) => b.getTime() - a.getTime());
      
      const lastPurchaseDate = sortedDates[0];
      const daysSinceLastPurchase = differenceInDays(startOfDay(new Date()), startOfDay(lastPurchaseDate));

      // RFM Segmentation rules (Simplified)
      let segment: 'Frecuente' | 'Nuevo' | 'En Riesgo' | 'Inactivo' = 'Nuevo';
      if (frequency > 3 && daysSinceLastPurchase <= 30) {
        segment = 'Frecuente';
      } else if (frequency > 1 && daysSinceLastPurchase > 60) {
        segment = 'En Riesgo';
      } else if (daysSinceLastPurchase > 120) {
        segment = 'Inactivo';
      } else {
        segment = 'Nuevo';
      }

      // Favorite product logic (simplified)
      const productCounts: Record<string, number> = {};
      customerOrders.forEach(o => {
        o.items.forEach(item => {
          productCounts[item.recipe_id] = (productCounts[item.recipe_id] || 0) + item.quantity;
        });
      });
      
      let favoriteRecipeId: string | undefined;
      let maxCount = 0;
      Object.entries(productCounts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteRecipeId = id;
        }
      });

      intelligenceMap[customer.id] = {
        ltv: totalSpent,
        frequency,
        averageTicket,
        segment,
        lastPurchaseDate,
        favoriteRecipeId,
      };
    });

    return intelligenceMap;
  }, [orders, customers]);
}
