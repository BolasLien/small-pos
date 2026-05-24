import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import { DEFAULT_SERIES } from '../types';

const STORAGE_KEY = 'small-pos:series';

export type SeriesResult = { isOk: boolean; reason?: string };

export type UseSeriesResult = {
  seriess: string[];
  addSeries: (name: string) => SeriesResult;
  renameSeriesRaw: (oldName: string, newName: string) => SeriesResult;
  deleteSeriesRaw: (name: string) => void;
  ensureSeries: (name: string) => void;
};

const normalize = (s: string): string => s.trim();

export const useSeries = (): UseSeriesResult => {
  const [seriess, setSeriess] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEY, DEFAULT_SERIES),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, seriess);
  }, [seriess]);

  const addSeries = useCallback<UseSeriesResult['addSeries']>(
    (name) => {
      const trimmed = normalize(name);
      if (!trimmed) return { isOk: false, reason: '名稱不可空白' };
      if (seriess.includes(trimmed)) return { isOk: false, reason: '名稱已存在' };
      setSeriess((prev) => [...prev, trimmed]);
      return { isOk: true };
    },
    [seriess],
  );

  const renameSeriesRaw = useCallback<UseSeriesResult['renameSeriesRaw']>(
    (oldName, newName) => {
      const trimmed = normalize(newName);
      if (!trimmed) return { isOk: false, reason: '名稱不可空白' };
      if (trimmed === oldName) return { isOk: true };
      if (seriess.includes(trimmed)) return { isOk: false, reason: '名稱已存在' };
      setSeriess((prev) => prev.map((s) => (s === oldName ? trimmed : s)));
      return { isOk: true };
    },
    [seriess],
  );

  const deleteSeriesRaw = useCallback((name: string) => {
    setSeriess((prev) => prev.filter((s) => s !== name));
  }, []);

  const ensureSeries = useCallback((name: string) => {
    const trimmed = normalize(name);
    if (!trimmed) return;
    setSeriess((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  }, []);

  return { seriess, addSeries, renameSeriesRaw, deleteSeriesRaw, ensureSeries };
};
