// Shrinks a screenshot so uploads stay fast and cheap while chart text stays readable.
function viaImg(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      res(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error('Not an image'));
    };
    img.src = url;
  });
}

function loadBitmap(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file).catch(() => viaImg(file));
  return viaImg(file);
}

export async function shrink(file, max = 1800) {
  const src = await loadBitmap(file);
  const w = src.naturalWidth || src.width;
  const h = src.naturalHeight || src.height;
  const scale = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * scale));
  c.height = Math.max(1, Math.round(h * scale));
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.88);
}

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
