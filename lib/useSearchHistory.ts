'use client';
import { useState, useEffect } from 'react';

const KEY = 'paysmart_history';
const MAX = 8;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const push = (q: string) => {
    const term = q.trim();
    if (!term) return;
    setHistory((prev) => {
      const updated = [term, ...prev.filter((h) => h !== term)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { history, push };
}
