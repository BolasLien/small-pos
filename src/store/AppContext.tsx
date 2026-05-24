import { createContext, useContext, type ReactNode } from 'react';
import { useProducts, type UseProductsResult } from '../features/products/hooks/useProducts';
import { useSales, type UseSalesResult } from '../features/sales/hooks/useSales';

type AppContextValue = {
  productsApi: UseProductsResult;
  salesApi: UseSalesResult;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const productsApi = useProducts();
  const salesApi = useSales();
  return (
    <AppContext.Provider value={{ productsApi, salesApi }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};
