const pad = (n: number): string => n.toString().padStart(2, '0');

export const isSameLocalDay = (isoString: string, ref: Date = new Date()): boolean => {
  const d = new Date(isoString);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
};

export const formatDateTime = (isoString: string): string => {
  const d = new Date(isoString);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

export const formatTime = (isoString: string): string => {
  const d = new Date(isoString);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatTodayLabel = (ref: Date = new Date()): string => {
  return `${ref.getFullYear()}/${pad(ref.getMonth() + 1)}/${pad(ref.getDate())}`;
};
