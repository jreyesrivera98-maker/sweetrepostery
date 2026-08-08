import { useAuthStore } from '../store/useAuthStore';

export function useRBAC() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'seller';

  return {
    role,
    isAdmin: role === 'admin',
    isBaker: role === 'baker',
    isSeller: role === 'seller',
    // Visibility flags
    canSeeMargins: role === 'admin',
    canSeeBaseCosts: role === 'admin',
    canEditConfig: role === 'admin',
    canEditRecipes: role === 'admin' || role === 'baker',
    canViewKDS: role === 'admin' || role === 'baker',
    canViewInventory: role === 'admin' || role === 'baker',
    canViewSuppliers: role === 'admin',
    canCreateQuotes: role === 'admin' || role === 'seller',
    canViewReports: role === 'admin',
    canViewCRM: role === 'admin' || role === 'seller',
    canViewFinancials: role === 'admin',
  };
}
