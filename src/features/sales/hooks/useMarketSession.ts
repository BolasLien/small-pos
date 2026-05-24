import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import type { MarketInfo } from '../types';

const STORAGE_KEY = 'small-pos:market-session';

const EMPTY: MarketInfo = { name: '', location: '' };

export type UseMarketSessionResult = {
  market: MarketInfo;
  setMarket: (next: MarketInfo) => void;
  clearMarket: () => void;
  hasMarket: boolean;
};

export const useMarketSession = (): UseMarketSessionResult => {
  const [market, setMarketState] = useState<MarketInfo>(() =>
    readStorage<MarketInfo>(STORAGE_KEY, EMPTY),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, market);
  }, [market]);

  const setMarket = useCallback((next: MarketInfo) => {
    setMarketState({ name: next.name.trim(), location: next.location.trim() });
  }, []);

  const clearMarket = useCallback(() => setMarketState(EMPTY), []);

  const hasMarket = market.name !== '' || market.location !== '';

  return { market, setMarket, clearMarket, hasMarket };
};
