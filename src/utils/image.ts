export const IMAGE_MAX_BYTES = 60 * 1024;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });

const renderToDataUrl = (
  img: HTMLImageElement,
  maxSize: number,
  quality: number,
): string => {
  const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const width = Math.max(1, Math.round(img.width * ratio));
  const height = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context not available');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
};

const getBase64Bytes = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1] ?? '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
};

export type ResizeResult = {
  dataUrl: string;
  bytes: number;
  isOversize: boolean;
};

export const resizeImageToDataUrl = async (
  file: File,
  maxBytes: number = IMAGE_MAX_BYTES,
): Promise<ResizeResult> => {
  const original = await readFileAsDataUrl(file);
  const img = await loadImage(original);

  const attempts: Array<{ maxSize: number; quality: number }> = [
    { maxSize: 400, quality: 0.82 },
    { maxSize: 360, quality: 0.72 },
    { maxSize: 320, quality: 0.62 },
    { maxSize: 280, quality: 0.52 },
    { maxSize: 240, quality: 0.45 },
  ];

  let last: ResizeResult | null = null;
  for (const { maxSize, quality } of attempts) {
    const dataUrl = renderToDataUrl(img, maxSize, quality);
    const bytes = getBase64Bytes(dataUrl);
    last = { dataUrl, bytes, isOversize: bytes > maxBytes };
    if (!last.isOversize) return last;
  }
  return last as ResizeResult;
};
