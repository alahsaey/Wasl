import { useState, useEffect } from 'react';

const DARK_MODE_KEY = 'nashrak_dark_mode';

type DarkModeListener = (isDark: boolean) => void;
const listeners = new Set<DarkModeListener>();

export function subscribeToDarkMode(listener: DarkModeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getIsDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  return document.documentElement.classList.contains('dark');
}

export function applyThemeToDom(isDark: boolean) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    if (document.body) {
      document.body.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    if (document.body) {
      document.body.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
    }
  }
}

export function setDarkMode(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DARK_MODE_KEY, enabled ? 'true' : 'false');
  applyThemeToDom(enabled);

  listeners.forEach((fn) => {
    try {
      fn(enabled);
    } catch (e) {
      console.error('DarkMode listener error:', e);
    }
  });

  window.dispatchEvent(new CustomEvent('nashrak-theme-change', { detail: { isDark: enabled } }));
}

export function initDarkMode() {
  if (typeof window === 'undefined') return;
  const isDark = getIsDarkMode();
  applyThemeToDom(isDark);
}

export function useDarkMode() {
  const [isDark, setIsDarkState] = useState<boolean>(getIsDarkMode());

  useEffect(() => {
    setIsDarkState(getIsDarkMode());
    const unsub = subscribeToDarkMode((nextDark) => {
      setIsDarkState(nextDark);
    });
    return unsub;
  }, []);

  const toggle = () => {
    const next = !isDark;
    setDarkMode(next);
  };

  return {
    isDark,
    toggle,
    setDarkMode,
  };
}
