import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, Recipe, Ingredient, Customer, Supplier, Quote, DesignRender } from '../types';

interface DataState {
  orders: Order[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  customers: Customer[];
  suppliers: Supplier[];
  quotes: Quote[];
  designRenders: DesignRender[];

  // Orders
  addOrder: (order: Order) => void;
  updateOrder: (id: string, partial: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Recipes
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, partial: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Ingredients
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, partial: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Customers
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, partial: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Suppliers
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, partial: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Quotes
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, partial: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      orders: [],
      recipes: [],
      ingredients: [],
      customers: [],
      suppliers: [],
      quotes: [],
      designRenders: [],

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, partial) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, ...partial } : o)
      })),
      deleteOrder: (id) => set((state) => ({ orders: state.orders.filter(o => o.id !== id) })),

      addRecipe: (recipe) => set((state) => ({ recipes: [recipe, ...state.recipes] })),
      updateRecipe: (id, partial) => set((state) => ({
        recipes: state.recipes.map(r => r.id === id ? { ...r, ...partial } : r)
      })),
      deleteRecipe: (id) => set((state) => ({ recipes: state.recipes.filter(r => r.id !== id) })),

      addIngredient: (ingredient) => set((state) => ({ ingredients: [ingredient, ...state.ingredients] })),
      updateIngredient: (id, partial) => set((state) => ({
        ingredients: state.ingredients.map(i => i.id === id ? { ...i, ...partial } : i)
      })),
      deleteIngredient: (id) => set((state) => ({ ingredients: state.ingredients.filter(i => i.id !== id) })),

      addCustomer: (customer) => set((state) => ({ customers: [customer, ...state.customers] })),
      updateCustomer: (id, partial) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...partial } : c)
      })),
      deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter(c => c.id !== id) })),

      addSupplier: (supplier) => set((state) => ({ suppliers: [supplier, ...state.suppliers] })),
      updateSupplier: (id, partial) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...partial } : s)
      })),
      deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) })),

      addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
      updateQuote: (id, partial) => set((state) => ({
        quotes: state.quotes.map(q => q.id === id ? { ...q, ...partial } : q)
      })),
      deleteQuote: (id) => set((state) => ({ quotes: state.quotes.filter(q => q.id !== id) })),
    }),
    {
      name: 'marea-data-storage', // key in localStorage
    }
  )
);
