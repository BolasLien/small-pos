import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useProducts, type UseProductsResult } from '../features/products/hooks/useProducts';
import { useSales, type UseSalesResult } from '../features/sales/hooks/useSales';
import {
  useSeries,
  type SeriesResult,
  type UseSeriesResult,
} from '../features/products/hooks/useSeries';

export type SeriesActions = {
  seriess: string[];
  addSeries: UseSeriesResult['addSeries'];
  renameSeries: (oldName: string, newName: string) => SeriesResult;
  deleteSeries: (name: string) => SeriesResult;
  ensureSeries: UseSeriesResult['ensureSeries'];
  countBySeries: UseProductsResult['countBySeries'];
};

type AppContextValue = {
  productsApi: UseProductsResult;
  salesApi: UseSalesResult;
  seriesApi: SeriesActions;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const productsApi = useProducts();
  const salesApi = useSales();
  const rawSeries = useSeries();

  const renameSeries = useCallback<SeriesActions['renameSeries']>(
    (oldName, newName) => {
      const result = rawSeries.renameSeriesRaw(oldName, newName);
      if (result.isOk && newName.trim() !== oldName) {
        productsApi.bulkRenameSeries(oldName, newName.trim());
      }
      return result;
    },
    [rawSeries, productsApi],
  );

  const deleteSeries = useCallback<SeriesActions['deleteSeries']>(
    (name) => {
      const count = productsApi.countBySeries(name);
      if (count > 0) {
        return { isOk: false, reason: `有 ${count} 個商品仍使用此系列，請先改用其他系列` };
      }
      rawSeries.deleteSeriesRaw(name);
      return { isOk: true };
    },
    [rawSeries, productsApi],
  );

  const seriesApi = useMemo<SeriesActions>(
    () => ({
      seriess: rawSeries.seriess,
      addSeries: rawSeries.addSeries,
      renameSeries,
      deleteSeries,
      ensureSeries: rawSeries.ensureSeries,
      countBySeries: productsApi.countBySeries,
    }),
    [rawSeries, renameSeries, deleteSeries, productsApi.countBySeries],
  );

  return (
    <AppContext.Provider value={{ productsApi, salesApi, seriesApi }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};
