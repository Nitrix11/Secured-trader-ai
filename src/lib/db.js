// IndexedDB keeps every analysis (and its screenshots) on the device with no practical upload cap.
const NAME = 'nitrix-ai-trader';
const STORE = 'analyses';
let dbp;

function open() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbp;
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req ? req.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}

export const all = () => run('readonly', (s) => s.getAll());
export const put = (rec) => run('readwrite', (s) => s.put(rec));
export const del = (id) => run('readwrite', (s) => s.delete(id));
export const clear = () => run('readwrite', (s) => s.clear());
