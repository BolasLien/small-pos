import { useCallback, useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { readStorage, writeStorage } from '../../../utils/storage';
import { createId } from '../../../utils/id';
import type { Channel, ChannelDraft } from '../types';

const STORAGE_KEY = 'small-pos:channels';
const SALES_KEY = 'small-pos:sales';
const LEGACY_MARKET_SESSION_KEY = 'small-pos:market-session';

type LegacySaleForSeed = {
  channelName?: string;
  channelLocation?: string;
  marketName?: string;
  marketLocation?: string;
};

const makeKey = (name: string, location?: string): string =>
  `${name.trim()}|||${(location ?? '').trim()}`;

const seedFromLegacy = (): Channel[] => {
  const seen = new Set<string>();
  const seeded: Channel[] = [];

  const sales = readStorage<LegacySaleForSeed[]>(SALES_KEY, []);
  sales.forEach((s) => {
    const name = (s.channelName ?? s.marketName ?? '').trim();
    const location = (s.channelLocation ?? s.marketLocation ?? '').trim();
    if (!name && !location) return;
    const key = makeKey(name, location);
    if (seen.has(key)) return;
    seen.add(key);
    seeded.push({
      id: createId(),
      name: name || location,
      location: location || undefined,
    });
  });

  const legacy = readStorage<{ name: string; location: string }>(LEGACY_MARKET_SESSION_KEY, {
    name: '',
    location: '',
  });
  const lname = legacy.name?.trim() ?? '';
  const lloc = legacy.location?.trim() ?? '';
  if (lname || lloc) {
    const key = makeKey(lname, lloc);
    if (!seen.has(key)) {
      seeded.push({ id: createId(), name: lname || lloc, location: lloc || undefined });
    }
  }
  return seeded;
};

const loadInitial = (): Channel[] => {
  const stored = readStorage<Channel[]>(STORAGE_KEY, []);
  if (stored.length > 0) return stored;
  const seeded = seedFromLegacy();
  if (seeded.length > 0) writeStorage(STORAGE_KEY, seeded);
  return seeded;
};

export type ChannelResult = { isOk: boolean; reason?: string };
export type AddChannelResult = ChannelResult & { channel?: Channel };

export type UseChannelsResult = {
  channels: Channel[];
  addChannel: (draft: ChannelDraft) => AddChannelResult;
  updateChannel: (id: string, draft: ChannelDraft) => ChannelResult;
  deleteChannel: (id: string) => void;
  reorderChannels: (fromIndex: number, toIndex: number) => void;
};

export const useChannels = (): UseChannelsResult => {
  const [channels, setChannels] = useState<Channel[]>(() => loadInitial());

  useEffect(() => {
    writeStorage(STORAGE_KEY, channels);
  }, [channels]);

  const addChannel = useCallback<UseChannelsResult['addChannel']>(
    (draft) => {
      const name = draft.name.trim();
      const location = draft.location?.trim() || undefined;
      if (!name) return { isOk: false, reason: '名稱不可空白' };
      const key = makeKey(name, location);
      const exists = channels.some((c) => makeKey(c.name, c.location) === key);
      if (exists) return { isOk: false, reason: '已有相同通路' };
      const channel: Channel = { id: createId(), name, location };
      setChannels((prev) => [...prev, channel]);
      return { isOk: true, channel };
    },
    [channels],
  );

  const updateChannel = useCallback<UseChannelsResult['updateChannel']>(
    (id, draft) => {
      const name = draft.name.trim();
      const location = draft.location?.trim() || undefined;
      if (!name) return { isOk: false, reason: '名稱不可空白' };
      const key = makeKey(name, location);
      const dup = channels.some(
        (c) => c.id !== id && makeKey(c.name, c.location) === key,
      );
      if (dup) return { isOk: false, reason: '已有相同通路' };
      setChannels((prev) => prev.map((c) => (c.id === id ? { id, name, location } : c)));
      return { isOk: true };
    },
    [channels],
  );

  const deleteChannel = useCallback((id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const reorderChannels = useCallback((fromIndex: number, toIndex: number) => {
    setChannels((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      return arrayMove(prev, fromIndex, toIndex);
    });
  }, []);

  return { channels, addChannel, updateChannel, deleteChannel, reorderChannels };
};
