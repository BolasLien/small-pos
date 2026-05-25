import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import type { Channel } from '../types';

const STORAGE_KEY = 'small-pos:current-channel';
const LEGACY_KEY = 'small-pos:market-session';

const resolveInitial = (channels: Channel[]): string | null => {
  const stored = readStorage<string | null>(STORAGE_KEY, null);
  if (stored && channels.some((c) => c.id === stored)) return stored;

  const legacy = readStorage<{ name: string; location: string }>(LEGACY_KEY, {
    name: '',
    location: '',
  });
  const lname = legacy.name?.trim() ?? '';
  const lloc = legacy.location?.trim() ?? '';
  if (lname || lloc) {
    const matched = channels.find(
      (c) => c.name.trim() === lname && (c.location ?? '').trim() === lloc,
    );
    if (matched) return matched.id;
  }
  return null;
};

export type UseCurrentChannelResult = {
  currentChannelId: string | null;
  currentChannel: Channel | null;
  setCurrentChannelId: (id: string | null) => void;
};

export const useCurrentChannel = (channels: Channel[]): UseCurrentChannelResult => {
  const [currentChannelId, setCurrentIdState] = useState<string | null>(() =>
    resolveInitial(channels),
  );

  useEffect(() => {
    if (currentChannelId !== null && !channels.some((c) => c.id === currentChannelId)) {
      setCurrentIdState(null);
    }
  }, [channels, currentChannelId]);

  useEffect(() => {
    writeStorage(STORAGE_KEY, currentChannelId);
  }, [currentChannelId]);

  const setCurrentChannelId = useCallback((id: string | null) => {
    setCurrentIdState(id);
  }, []);

  const currentChannel =
    currentChannelId === null
      ? null
      : (channels.find((c) => c.id === currentChannelId) ?? null);

  return { currentChannelId, currentChannel, setCurrentChannelId };
};
