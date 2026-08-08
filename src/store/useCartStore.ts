import { create } from 'zustand';
import type { Recipe } from '../types';

interface CartItem {
  recipe: Recipe;
  quantity: number;
  notes: string;
}

interface CartState {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryDate: string;
  deliveryNotes: string;
  addItem: (recipe: Recipe) => void;
  removeItem: (recipeId: string) => void;
  updateQuantity: (recipeId: string, quantity: number) => void;
  setCustomerInfo: (info: Partial<Pick<CartState, 'customerName' | 'customerPhone' | 'customerEmail' | 'deliveryDate' | 'deliveryNotes'>>) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryDate: '',
  deliveryNotes: '',
  addItem: (recipe) => {
    const existing = get().items.find((i) => i.recipe.id === recipe.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.recipe.id === recipe.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, { recipe, quantity: 1, notes: '' }] }));
    }
  },
  removeItem: (recipeId) =>
    set((state) => ({ items: state.items.filter((i) => i.recipe.id !== recipeId) })),
  updateQuantity: (recipeId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.recipe.id !== recipeId)
        : state.items.map((i) => (i.recipe.id === recipeId ? { ...i, quantity } : i)),
    })),
  setCustomerInfo: (info) => set((state) => ({ ...state, ...info })),
  clearCart: () => set({ items: [], customerName: '', customerPhone: '', customerEmail: '', deliveryDate: '', deliveryNotes: '' }),
  total: () => get().items.reduce((sum, i) => sum + i.recipe.sale_price * i.quantity, 0),
}));
