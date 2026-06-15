import { useState, useCallback, useRef } from 'react';
import { parseCSV, pickRandomSegment } from '../lib/parser';
import { KLine, GameSettings } from '../lib/types';
import { stockList, StockMeta } from '../data/index';

interface LoadedData {
  stock: { symbol: string; name: string; candles: KLine[] };
  benchmark: KLine[];
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef(new Map<string, KLine[]>()).current;

  const loadStock = useCallback(async (meta: StockMeta, settings: GameSettings): Promise<LoadedData | null> => {
    setLoading(true);
    setError(null);
    try {
      if (!cache.has(meta.file)) {
        const resp = await fetch(meta.file);
        if (!resp.ok) throw new Error(`Failed to load ${meta.file}`);
        const text = await resp.text();
        cache.set(meta.file, parseCSV(text));
      }

      const benchmarkFile = '/data/510210_上证综指ETF.csv';
      if (!cache.has(benchmarkFile)) {
        const resp = await fetch(benchmarkFile);
        const text = await resp.text();
        cache.set(benchmarkFile, parseCSV(text));
      }

      const stockCandles = cache.get(meta.file)!;
      const benchmarkCandles = cache.get(benchmarkFile)!;

      const segment = pickRandomSegment(stockCandles, settings.candleCount);
      const startDate = segment[0].date;
      const endDate = segment[segment.length - 1].date;
      const benchmarkSegment = benchmarkCandles.filter(
        c => c.date >= startDate && c.date <= endDate
      );

      setLoading(false);
      return {
        stock: { symbol: meta.symbol, name: meta.name, candles: segment },
        benchmark: benchmarkSegment,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setLoading(false);
      return null;
    }
  }, [cache]);

  return { stockList, loadStock, loading, error };
}
