import { useRef, useEffect, useMemo } from 'react';
import { createChart, CrosshairMode, UTCTimestamp } from 'lightweight-charts';
import { useGameState } from '../hooks/useGameState';
import { computeIndicators } from '../lib/indicators';
import { KLine, IndicatorValues } from '../lib/types';

function toUTC(dateStr: string): UTCTimestamp {
  return (new Date(dateStr).getTime() / 1000) as UTCTimestamp;
}

function buildCandleData(candles: KLine[], upTo: number) {
  return candles.slice(0, upTo + 1).map(c => ({
    time: toUTC(c.date),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}

function buildLineData(values: (number | null)[], candles: KLine[], upTo: number) {
  const result: { time: UTCTimestamp; value: number }[] = [];
  for (let i = 0; i <= upTo; i++) {
    if (values[i] !== null) {
      result.push({ time: toUTC(candles[i].date), value: values[i]! });
    }
  }
  return result;
}

export default function ChartPanel() {
  const { state } = useGameState();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<ReturnType<typeof createChart>[]>([]);
  const seriesRef = useRef<Map<string, any>>(new Map());

  const upTo = state.currentIndex;
  const candles = state.stock.candles;
  const indicators = useMemo(() => computeIndicators(candles), [candles]);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    chartsRef.current.forEach(c => c.remove());
    chartsRef.current = [];
    seriesRef.current.clear();

    const parent = containerRef.current;
    const parentWidth = parent.clientWidth;
    const mainHeight = 300;
    const subHeight = 100;
    const totalHeight = mainHeight + subHeight * 4;

    parent.style.height = `${totalHeight}px`;

    const commonOptions = {
      width: parentWidth,
      layout: { background: { color: '#030712' }, textColor: '#9ca3af' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#374151' },
      rightPriceScale: { borderColor: '#374151' },
    };

    const mainChart = createChart(parent, { ...commonOptions, height: mainHeight });
    chartsRef.current.push(mainChart);

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#ef4444', downColor: '#22c55e', borderUpColor: '#ef4444', borderDownColor: '#22c55e', wickUpColor: '#ef4444', wickDownColor: '#22c55e',
    });
    candleSeries.setData(buildCandleData(candles, upTo));
    seriesRef.current.set('candles', candleSeries);

    const maColors = ['#fbbf24', '#a78bfa', '#60a5fa'];
    const maKeys = ['ma5', 'ma20', 'ma60'];
    maKeys.forEach((key, i) => {
      const data = buildLineData(indicators[key as keyof IndicatorValues] as (number | null)[], candles, upTo);
      if (data.length > 0) {
        const series = mainChart.addLineSeries({ color: maColors[i], lineWidth: 1 });
        series.setData(data);
        seriesRef.current.set(key, series);
      }
    });

    const volChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(volChart);
    const volSeries = volChart.addHistogramSeries({ color: '#60a5fa', priceFormat: { type: 'volume' } });
    volSeries.setData(candles.slice(0, upTo + 1).map(c => ({
      time: toUTC(c.date),
      value: c.volume,
      color: c.close >= c.open ? '#ef444480' : '#22c55e80',
    })));
    seriesRef.current.set('volume', volSeries);

    const macdChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(macdChart);
    const macdData = indicators.macd.slice(0, upTo + 1);
    if (macdData.length > 0) {
      const difSeries = macdChart.addLineSeries({ color: '#60a5fa', lineWidth: 1 });
      difSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dif })));
      const deaSeries = macdChart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
      deaSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dea })));
      const histSeries = macdChart.addHistogramSeries({});
      histSeries.setData(macdData.map(d => ({
        time: toUTC(d.time), value: d.macd,
        color: d.macd >= 0 ? '#ef444480' : '#22c55e80',
      })));
    }

    const kdjChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(kdjChart);
    const kdjData = indicators.kdj.slice(0, upTo + 1);
    if (kdjData.length > 0) {
      const colors = ['#fbbf24', '#a78bfa', '#60a5fa'];
      ['k', 'd', 'j'].forEach((key, i) => {
        const series = kdjChart.addLineSeries({ color: colors[i], lineWidth: 1 });
        series.setData(kdjData.map(d => ({ time: toUTC(d.time), value: d[key as keyof typeof d] as number })));
      });
    }

    const atrChart = createChart(parent, { ...commonOptions, height: subHeight });
    chartsRef.current.push(atrChart);
    const atrData = indicators.atr.slice(0, upTo + 1);
    if (atrData.length > 0) {
      const atrSeries = atrChart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
      atrSeries.setData(atrData.map(d => ({ time: toUTC(d.time), value: d.atr })));
    }

    chartsRef.current.forEach(c => c.timeScale().fitContent());

    return () => {
      chartsRef.current.forEach(c => c.remove());
    };
  }, [candles, upTo, indicators]);

  return <div ref={containerRef} className="w-full" />;
}
