import React, { createContext, useContext, useRef } from 'react';

interface TransitionState {
  currentScreen: number;
  isAnimating: boolean;
  /** Normalized offset of the container: 0 = top, -1 = one screen up, etc. */
  containerOffset: number;
  /** 0–1 progress within the current *pair* of screens (for parallax) */
  pairProgress: number;
  /** Direction of last transition: 1 = forward (down), -1 = backward (up) */
  direction: 1 | -1;
}

const TransitionCtx = createContext<TransitionState>({
  currentScreen: 0,
  isAnimating: false,
  containerOffset: 0,
  pairProgress: 0,
  direction: 1,
});

export const useTransition = () => useContext(TransitionCtx);

interface ProviderProps {
  children: React.ReactNode;
  stateRef: React.MutableRefObject<TransitionState>;
}

export const TransitionProvider: React.FC<ProviderProps> = ({ children, stateRef }) => {
  // We re-render via a force-update counter every rAF
  const [, setTick] = React.useState(0);
  const raf = useRef(0);

  React.useEffect(() => {
    const tick = () => {
      setTick((n) => (n + 1) % 1_000_000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <TransitionCtx.Provider value={stateRef.current}>
      {children}
    </TransitionCtx.Provider>
  );
};
