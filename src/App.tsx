import { useState } from 'react';
import { AppProvider } from './store/AppContext';
import { BottomNav, type NavKey } from './components/BottomNav/BottomNav';
import { SalesPage } from './pages/SalesPage';
import { ProductsPage } from './pages/ProductsPage';
import { StatsPage } from './pages/StatsPage';
import { RecordsPage } from './pages/RecordsPage';

const renderPage = (key: NavKey) => {
  switch (key) {
    case 'sales':
      return <SalesPage />;
    case 'products':
      return <ProductsPage />;
    case 'stats':
      return <StatsPage />;
    case 'records':
      return <RecordsPage />;
  }
};

export const App = () => {
  const [current, setCurrent] = useState<NavKey>('sales');

  return (
    <AppProvider>
      <div className="min-h-full bg-gray-50">
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-5">{renderPage(current)}</main>
        <BottomNav current={current} onChange={setCurrent} />
      </div>
    </AppProvider>
  );
};
