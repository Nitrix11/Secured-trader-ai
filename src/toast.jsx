import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(() => {});

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const timer = useRef();

  const show = useCallback((message, action) => {
    clearTimeout(timer.current);
    setT({ message, action });
    timer.current = setTimeout(() => setT(null), action ? 6000 : 2600);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {t && (
        <div className="toast" role="status">
          <span>{t.message}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action.onClick();
                setT(null);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
