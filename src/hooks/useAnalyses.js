import { useCallback, useEffect, useRef, useState } from 'react';
import * as DB from '../lib/db.js';
import { analyzeImages } from '../lib/ai.js';
import { uid } from '../lib/image.js';

// Charts added since the app was opened show on the Analyze screen; everything lives in History.
export const SESSION_START = Date.now();

export function useAnalyses() {
  const [recs, setRecs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const map = useRef(new Map());
  const queue = useRef([]);
  const running = useRef(false);

  const sync = useCallback(() => {
    setRecs([...map.current.values()].sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const save = useCallback(
    async (rec) => {
      map.current.set(rec.id, rec);
      sync();
      try {
        await DB.put(rec);
      } catch {
        /* the analysis still shows this session even if saving fails */
      }
    },
    [sync]
  );

  useEffect(() => {
    let alive = true;
    DB.all()
      .then((list) => {
        if (!alive) return;
        for (const r of list) {
          if (r.status === 'queued' || r.status === 'working') {
            const fixed = { ...r, status: 'error', error: 'This analysis was interrupted. Tap Analyze again.', errorCode: 'INTERRUPTED' };
            DB.put(fixed).catch(() => {});
            map.current.set(r.id, fixed);
          } else {
            map.current.set(r.id, r);
          }
        }
        sync();
        setLoaded(true);
      })
      .catch(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [sync]);

  const pump = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    while (queue.current.length) {
      const id = queue.current.shift();
      const rec = map.current.get(id);
      if (!rec) continue;
      await save({ ...rec, status: 'working', error: null, errorCode: null });
      try {
        const result = await analyzeImages({ images: rec.images, note: rec.note, style: rec.style });
        const cur = map.current.get(id);
        if (cur) await save({ ...cur, status: 'done', result, error: null, errorCode: null });
      } catch (e) {
        const cur = map.current.get(id);
        if (cur) await save({ ...cur, status: 'error', error: e.message || String(e), errorCode: e.code || 'ERROR' });
      }
    }
    running.current = false;
  }, [save]);

  const add = useCallback(
    async (images, { note, style, together }) => {
      const groups = together ? [images] : images.map((i) => [i]);
      const now = Date.now();
      for (let i = 0; i < groups.length; i++) {
        const rec = { id: uid(), createdAt: now - i, images: groups[i], note, style, status: 'queued' };
        await save(rec);
        queue.current.push(rec.id);
      }
      pump();
    },
    [save, pump]
  );

  const retry = useCallback(
    async (id) => {
      const rec = map.current.get(id);
      if (!rec) return;
      await save({ ...rec, status: 'queued', error: null, errorCode: null });
      queue.current.push(id);
      pump();
    },
    [save, pump]
  );

  const remove = useCallback(
    (id) => {
      map.current.delete(id);
      sync();
      DB.del(id).catch(() => {});
    },
    [sync]
  );

  const restore = useCallback((rec) => save(rec), [save]);

  const clearAll = useCallback(async () => {
    map.current.clear();
    queue.current = [];
    sync();
    try {
      await DB.clear();
    } catch {
      /* ignore */
    }
  }, [sync]);

  return { recs, loaded, add, retry, remove, restore, clearAll };
}
