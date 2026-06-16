import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createChart, CrosshairMode, UTCTimestamp, IChartApi, ISeriesApi, LineStyle, SeriesMarker } from 'lightweight-charts';
import { useGameState } from '../hooks/useGameState';
import { computeIndicators } from '../lib/indicators';
import { KLine, IndicatorValues, MACDData, KDJData, ATRData } from '../lib/types';

const UP = '#CC3311';
const DOWN = '#0077BB';
const MA5_C = '#009988';
const MA20_C = '#33BBEE';
const MA60_C = '#CC3311';
const KDJ_C = ['#009988', '#33BBEE', '#CC3311'];

function toUTC(dateStr: string): UTCTimestamp {
  return (new Date(dateStr).getTime() / 1000) as UTCTimestamp;
}

function buildCandleData(candles: KLine[], upTo: number) {
  return candles.slice(0, upTo + 1).map(c => ({
    time: toUTC(c.date),
    open: c.open, high: c.high, low: c.low, close: c.close,
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

interface CandleMeta {
  open: number; high: number; low: number; close: number; volume: number;
  changePct: number;
  ma5: number | null; ma20: number | null; ma60: number | null;
  obv: number; obvMa12: number | null;
  macd: MACDData | null;
  kdj: KDJData | null;
  atr: ATRData | null;
  superTrend: number | null; superTrendDir: number;
}

export default function ChartPanel() {
  const { state } = useGameState();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<IChartApi[]>([]);
  const seriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map());
  const repSeriesRef = useRef<ISeriesApi<any>[]>([]);
  const paneRefs = useRef<HTMLDivElement[]>([]);
  const labelRefs = useRef<HTMLDivElement[]>([]);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      if (r.width > 0 && r.height > 0) setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { backgroundCandles, candles } = state.stock;
  const upTo = state.currentIndex;
  const rawCandles = useMemo(() => [...backgroundCandles, ...candles], [backgroundCandles, candles]);
  const rawIndicators = useMemo(() => computeIndicators(rawCandles), [rawCandles]);
  // Compute indicators on full 120+N data, then discard first 80
  // leaving 40 background + N game candles, with all indicators valid from index 0
  const TRIM = 80;
  const allCandles = useMemo(() => rawCandles.slice(TRIM), [rawCandles]);
  const indicators = useMemo(() => ({
    ma5: rawIndicators.ma5.slice(TRIM),
    ma20: rawIndicators.ma20.slice(TRIM),
    ma60: rawIndicators.ma60.slice(TRIM),
    obv: rawIndicators.obv.slice(TRIM),
    obvMa12: rawIndicators.obvMa12.slice(TRIM),
    macd: rawIndicators.macd.slice(TRIM),
    kdj: rawIndicators.kdj.slice(TRIM),
    atr: rawIndicators.atr.slice(TRIM),
  } as IndicatorValues), [rawIndicators]);
  const visibleEnd = 40 + upTo;

  const metaMap = useMemo(() => {
    const map = new Map<string, CandleMeta>();
    const MULT = 2;
    let stPrev = 0;
    for (let i = 0; i < allCandles.length; i++) {
      const c = allCandles[i];
      const prev = i > 0 ? allCandles[i - 1].close : c.close;
      const ma20Val = indicators.ma20[i] ?? null;
      const atrVal = indicators.atr[i]?.atr;
      // SuperTrend
      const hl2 = (c.high + c.low) / 2;
      const lower = hl2 - MULT * (atrVal ?? 0);
      const upper = hl2 + MULT * (atrVal ?? 0);
      let st: number; let stDir: number;
      if (i === 0 || c.close > stPrev) { st = lower; stDir = 1; }
      else { st = upper; stDir = -1; }
      stPrev = st;
      map.set(c.date, {
        open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume,
        changePct: prev !== 0 ? ((c.close - prev) / prev) * 100 : 0,
        ma5: indicators.ma5[i] ?? null, ma20: ma20Val, ma60: indicators.ma60[i] ?? null,
        obv: indicators.obv[i], obvMa12: indicators.obvMa12[i] ?? null,
        macd: indicators.macd[i] ?? null, kdj: indicators.kdj[i] ?? null, atr: indicators.atr[i] ?? null,
        superTrend: st, superTrendDir: stDir,
      });
    }
    return map;
  }, [allCandles, indicators]);

  // Update pane labels with current values
  useEffect(() => {
    if (visibleEnd < 0 || labelRefs.current.length === 0) return;
    const idx = visibleEnd;
    const fmt = (n: number, d = 2) => n.toFixed(d);

    // Main chart MA labels
    const ma5 = indicators.ma5[idx], ma20 = indicators.ma20[idx], ma60 = indicators.ma60[idx];
    if (labelRefs.current[0] && ma5 !== null) {
      labelRefs.current[0].innerHTML =
        `<span style="color:${MA5_C}">MA5:${fmt(ma5)}</span>  ` +
        `<span style="color:${MA20_C}">MA20:${fmt(ma20!)}</span>  ` +
        `<span style="color:${MA60_C}">MA60:${fmt(ma60!)}</span>`;
    }

    // KDJ
    const kdj = indicators.kdj[idx];
    if (labelRefs.current[1] && kdj) {
      const ob = kdj.k >= 90 || kdj.d >= 90 || kdj.j >= 90;
      const os = kdj.k <= 10 || kdj.d <= 10 || kdj.j <= 10;
      const warn = ob ? `<span style="color:#CC3311">超买</span>` : os ? `<span style="color:#009988">超卖</span>` : '';
      labelRefs.current[1].innerHTML =
        `<span style="color:${KDJ_C[0]}">K:${fmt(kdj.k)}</span>  ` +
        `<span style="color:${KDJ_C[1]}">D:${fmt(kdj.d)}</span>  ` +
        `<span style="color:${KDJ_C[2]}">J:${fmt(kdj.j)}</span>` +
        (warn ? `  ${warn}` : '');
    }

    // MACD
    const macd = indicators.macd[idx];
    if (labelRefs.current[2] && macd) {
      const macdColor = macd.macd >= 0 ? UP : DOWN;
      labelRefs.current[2].innerHTML =
        `<span style="color:${UP}">DIF:${fmt(macd.dif)}</span>  ` +
        `<span style="color:${DOWN}">DEA:${fmt(macd.dea)}</span>  ` +
        `<span style="color:${macdColor}">MACD:${fmt(macd.macd)}</span>`;
    }

    // OBV
    const obvMa12v = indicators.obvMa12[idx];
    if (labelRefs.current[3]) {
      labelRefs.current[3].innerHTML =
        `OBV:${fmt(indicators.obv[idx], 0)}` +
        (obvMa12v !== null ? `  <span style="color:#CC3311">MA12:${fmt(obvMa12v, 0)}</span>` : '');
    }

    // ATR Triple Channel
    if (labelRefs.current[4]) {
      const ma20 = indicators.ma20[idx];
      const a = indicators.atr[idx]?.atr ?? 0;
      if (ma20 !== null) {
        labelRefs.current[4].innerHTML =
          `<span style="color:#33BBEE">MID:${fmt(ma20)}</span>  ` +
          `<span style="color:#CC3311">+1:${fmt(ma20 + a)} +2:${fmt(ma20 + a * 2)} +3:${fmt(ma20 + a * 3)}</span>  ` +
          `<span style="color:#009988">-1:${fmt(ma20 - a)} -2:${fmt(ma20 - a * 2)} -3:${fmt(ma20 - a * 3)}</span>`;
      }
    }
  }, [visibleEnd, indicators]);

  const handleCrosshairMove = useCallback((params: any) => {
    const tip = tooltipRef.current;
    if (!tip) return;
    if (!params.time || !params.point) { tip.style.display = 'none'; return; }
    const ts = params.time as number;
    const dateStr = new Date(ts * 1000).toISOString().slice(0, 10);
    const c = metaMap.get(dateStr);
    if (!c) { tip.style.display = 'none'; return; }
    tip.style.display = 'block';
    const chartRect = containerRef.current!.getBoundingClientRect();
    let left = params.point.x + 15;
    let top = params.point.y - 60;
    if (params.point.x + 260 > chartRect.width) left = params.point.x - 265;
    if (params.point.y - 60 < 0) top = 5;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;

    const fmt = (n: number, d = 2) => n.toFixed(d);
    const upC = (n: number) => n >= 0 ? UP : DOWN;
    const lines: string[] = [];
    lines.push(`<span style="color:#e5e7eb;font-weight:bold">${dateStr}</span>`);
    lines.push(`开 ${fmt(c.open)}  高 ${fmt(c.high)}  低 ${fmt(c.low)}  收 <span style="color:${upC(c.close - c.open)}">${fmt(c.close)}</span>  <span style="color:${upC(c.changePct)}">${c.changePct >= 0 ? '+' : ''}${fmt(c.changePct, 2)}%</span>`);
    lines.push(`量 ${fmt(c.volume, 0)}   OBV ${fmt(c.obv, 0)}  ${c.obvMa12 !== null ? `OBV12 ${fmt(c.obvMa12, 0)}` : ''}`);
    if (c.ma5 !== null) lines.push(`<span style="color:${MA5_C}">MA5:${fmt(c.ma5)}</span>  <span style="color:${MA20_C}">MA20:${fmt(c.ma20!)}</span>  <span style="color:${MA60_C}">MA60:${fmt(c.ma60!)}</span>`);
    if (c.kdj) {
      const obTag = c.kdj.k >= 90 ? ' ⚠超买' : c.kdj.k <= 10 ? ' ⚠超卖' : '';
      lines.push(`<span style="color:${KDJ_C[0]}">K:${fmt(c.kdj.k)}</span>  <span style="color:${KDJ_C[1]}">D:${fmt(c.kdj.d)}</span>  <span style="color:${KDJ_C[2]}">J:${fmt(c.kdj.j)}</span>${obTag}`);
    }
    if (c.macd) lines.push(`<span style="color:${UP}">DIF:${fmt(c.macd.dif)}</span>  <span style="color:${DOWN}">DEA:${fmt(c.macd.dea)}</span>  <span style="color:${upC(c.macd.macd)}">MACD:${fmt(c.macd.macd)}</span>`);
    if (c.atr && c.ma20 !== null) {
      const a = c.atr.atr;
      lines.push(`<span style="color:#33BBEE">MID:${fmt(c.ma20)}</span>  ` +
        `<span style="color:#CC3311">+1:${fmt(c.ma20 + a)} +2:${fmt(c.ma20 + a * 2)} +3:${fmt(c.ma20 + a * 3)}</span>  ` +
        `<span style="color:#009988">-1:${fmt(c.ma20 - a)} -2:${fmt(c.ma20 - a * 2)} -3:${fmt(c.ma20 - a * 3)}</span>`);
    }
    tip.innerHTML = lines.join('<br>');
  }, [metaMap]);

  useEffect(() => {
    if (!containerRef.current || allCandles.length === 0 || dims.w <= 0 || dims.h <= 0) return;

    chartsRef.current.forEach(c => c.remove());
    chartsRef.current = [];
    seriesRef.current.clear();
    repSeriesRef.current = [];
    paneRefs.current.forEach(el => el.remove());
    paneRefs.current = [];
    labelRefs.current = [];

    const parent = containerRef.current;
    parent.innerHTML = '';
    const parentWidth = dims.w;
    const parentHeight = dims.h;
    const GAP = 1;
    const totalGap = GAP * 4;
    const mainRatio = 0.38;
    const mainHeight = Math.round((parentHeight - totalGap) * mainRatio);
    const subHeight = Math.round(((parentHeight - totalGap) - mainHeight) / 4);
    const scaleOpts = {
      leftPriceScale: { visible: false },
      rightPriceScale: { visible: false },
    };
    function subOpts(h: number) {
      return {
        width: parentWidth, height: h,
        layout: { background: { color: '#111322' }, textColor: '#8b8fa3' },
        grid: { vertLines: { color: '#1f2235' }, horzLines: { color: 'transparent' } },
        crosshair: { mode: CrosshairMode.Normal, horzLine: { visible: false } },
        timeScale: { borderColor: '#1f2235' },
        ...scaleOpts,
        handleScroll: false,
        handleScale: false,
      };
    }
    const mainOpts = {
      width: parentWidth, height: mainHeight,
      layout: { background: { color: '#111322' }, textColor: '#8b8fa3' },
      grid: { vertLines: { color: '#1f2235' }, horzLines: { color: 'transparent' } },
      crosshair: { mode: CrosshairMode.Normal, horzLine: { visible: false } },
      timeScale: { borderColor: '#1f2235' },
      ...scaleOpts,
      handleScroll: false,
      handleScale: false,
    };

    function makePane(height: number, gap = false): HTMLDivElement {
      const div = document.createElement('div');
      div.style.cssText = `position:relative;width:100%;height:${height}px${gap ? ';margin-top:1px' : ''}`;
      parent.appendChild(div);
      paneRefs.current.push(div);
      return div;
    }

    function addLabel(pane: HTMLDivElement, defaultHtml: string): HTMLDivElement {
      const label = document.createElement('div');
      label.style.cssText = 'position:absolute;z-index:5;left:6px;top:4px;font-size:10px;color:#8b8fa3;pointer-events:none;padding:2px 6px;border-radius:4px;background:rgba(11,13,23,0.7);backdrop-filter:blur(4px);border:1px solid rgba(31,34,53,0.6)';
      label.innerHTML = defaultHtml;
      pane.appendChild(label);
      labelRefs.current.push(label);
      return label;
    }

    // --- MAIN CHART (K-line + MA) ---
    const mainPane = makePane(mainHeight, false);
    const mainChart = createChart(mainPane, mainOpts);
    chartsRef.current.push(mainChart);

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#CC3311', downColor: '#6688BB',
      borderUpColor: '#CC3311', borderDownColor: '#6688BB',
      wickUpColor: '#CC3311', wickDownColor: '#6688BB',
      priceLineVisible: false,
    });
    candleSeries.setData(buildCandleData(allCandles, visibleEnd));
    seriesRef.current.set('candles', candleSeries);
    repSeriesRef.current.push(candleSeries);

    const maKeys = ['ma5', 'ma20', 'ma60'] as const;
    const maColors = [MA5_C, MA20_C, MA60_C];
    maKeys.forEach((key, i) => {
      const data = buildLineData(indicators[key as keyof IndicatorValues] as (number | null)[], allCandles, visibleEnd);
      if (data.length > 0) {
        const series = mainChart.addLineSeries({ color: maColors[i], lineWidth: 1, priceLineVisible: false });
        series.setData(data);
        seriesRef.current.set(key, series);
      }
    });

    // Trade markers
    const markers: SeriesMarker<UTCTimestamp>[] = [];
    for (const a of state.history) {
      if (a.index < 0 || a.index >= state.settings.candleCount) continue;
      const candleIdx = 40 + a.index;
      if (candleIdx >= allCandles.length) continue;
      markers.push({
        time: toUTC(allCandles[candleIdx].date),
        position: a.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
        shape: a.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
        color: a.type === 'buy' ? '#e11d48' : '#14b8a6',
        text: a.type === 'buy' ? 'B' : 'S',
        size: 1.5,
      });
    }
    if (markers.length > 0) candleSeries.setMarkers(markers);

    addLabel(mainPane, 'MA');

    // --- KDJ (pane index 1) ---
    const kdjPane = makePane(subHeight, true);
    const kdjChart = createChart(kdjPane, subOpts(subHeight));
    chartsRef.current.push(kdjChart);
    let kdjRepSeries: ISeriesApi<any> | null = null;
    const kdjData = indicators.kdj.slice(0, visibleEnd + 1);
    if (kdjData.length > 0) {
      // Overbought/oversold reference lines
      const refOpts = { color: '#5a5e73', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false } as const;
      const refData = kdjData.map(d => ({ time: toUTC(d.time), value: 90 }));
      kdjChart.addLineSeries(refOpts).setData(refData);
      kdjChart.addLineSeries(refOpts).setData(refData.map(d => ({ ...d, value: 10 })));
      ['k', 'd', 'j'].forEach((key, i) => {
        const series = kdjChart.addLineSeries({ color: KDJ_C[i], lineWidth: 1, priceLineVisible: false });
        series.setData(kdjData.map(d => ({ time: toUTC(d.time), value: d[key as keyof typeof d] as number })));
        if (i === 0) kdjRepSeries = series;
      });
    }
    repSeriesRef.current.push(kdjRepSeries!);
    addLabel(kdjPane, 'KDJ');

    // --- MACD (pane index 2) ---
    const macdPane = makePane(subHeight, true);
    const macdChart = createChart(macdPane, subOpts(subHeight));
    chartsRef.current.push(macdChart);
    let macdRepSeries: ISeriesApi<any> | null = null;
    const macdData = indicators.macd.slice(0, visibleEnd + 1);
    if (macdData.length > 0) {
      // Zero line
      macdChart.addLineSeries({ color: '#5a5e73', lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false } as const)
        .setData(macdData.map(d => ({ time: toUTC(d.time), value: 0 })));
      const difSeries = macdChart.addLineSeries({ color: UP, lineWidth: 1, priceLineVisible: false });
      difSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dif })));
      macdRepSeries = difSeries;
      const deaSeries = macdChart.addLineSeries({ color: DOWN, lineWidth: 1, priceLineVisible: false });
      deaSeries.setData(macdData.map(d => ({ time: toUTC(d.time), value: d.dea })));
    }
    repSeriesRef.current.push(macdRepSeries!);
    addLabel(macdPane, 'MACD');

    // --- OBV (pane index 3) ---
    const obvPane = makePane(subHeight, true);
    const obvChart = createChart(obvPane, subOpts(subHeight));
    chartsRef.current.push(obvChart);
    let obvRepSeries: ISeriesApi<any> | null = null;
    const obvData = indicators.obv.slice(0, visibleEnd + 1);
    if (obvData.length > 0) {
      // Volume histogram on its own price scale (independent scaling)
      const volSeries = obvChart.addHistogramSeries({ priceLineVisible: false, priceScaleId: 'volume' });
      volSeries.setData(
        allCandles.slice(0, visibleEnd + 1).map(c => ({
          time: toUTC(c.date), value: c.volume,
          color: c.close >= c.open ? '#CC3311' : '#6688BB',
        }))
      );
      obvChart.priceScale('volume').applyOptions({ visible: false });
      const obvSeries = obvChart.addLineSeries({ color: '#009988', lineWidth: 1, priceLineVisible: false });
      obvSeries.setData(allCandles.slice(0, visibleEnd + 1).map((c, i) => ({
        time: toUTC(c.date), value: indicators.obv[i],
      })));
      obvRepSeries = obvSeries;
      // OBV MA12 overlay
      const obvMa12Data = buildLineData(indicators.obvMa12, allCandles, visibleEnd);
      if (obvMa12Data.length > 0) {
        obvChart.addLineSeries({ color: '#CC3311', lineWidth: 1, priceLineVisible: false }).setData(obvMa12Data);
      }
    }
    repSeriesRef.current.push(obvRepSeries!);
    addLabel(obvPane, 'OBV');

    // --- ATR Triple Channel (pane index 4) ---
    const atrPane = makePane(subHeight, true);
    const atrChart = createChart(atrPane, subOpts(subHeight));
    chartsRef.current.push(atrChart);
    let atrRepSeries: ISeriesApi<any> | null = null;
    const atrData = indicators.atr.slice(0, visibleEnd + 1);
    if (atrData.length > 0) {
      const midData = buildLineData(indicators.ma20, allCandles, visibleEnd);
      const makeUpper = (mult: number) => indicators.atr.slice(0, visibleEnd + 1).map((d, i) => ({
        time: toUTC(allCandles[i].date), value: allCandles[i].close + d.atr * mult,
      }));
      const makeLower = (mult: number) => indicators.atr.slice(0, visibleEnd + 1).map((d, i) => ({
        time: toUTC(allCandles[i].date), value: allCandles[i].close - d.atr * mult,
      }));
      // Middle: MA20
      const midSeries = atrChart.addLineSeries({ color: '#33BBEE', lineWidth: 1, priceLineVisible: false });
      midSeries.setData(midData);
      atrRepSeries = midSeries;
      // Upper bands: 1×, 2×, 3× ATR
      [1, 2, 3].forEach(mult => {
        atrChart.addLineSeries({
          color: mult === 1 ? '#CC331199' : mult === 2 ? '#CC3311CC' : '#CC3311',
          lineWidth: 1, priceLineVisible: false,
        }).setData(makeUpper(mult));
      });
      // Lower bands: -1×, -2×, -3× ATR
      [1, 2, 3].forEach(mult => {
        atrChart.addLineSeries({
          color: mult === 1 ? '#00998899' : mult === 2 ? '#009988CC' : '#009988',
          lineWidth: 1, priceLineVisible: false,
        }).setData(makeLower(mult));
      });
    }
    repSeriesRef.current.push(atrRepSeries!);
    addLabel(atrPane, 'ATR×3');

    // Remove old time scale sync — scrolling/zooming is disabled
    // Set fixed visible range: 40 candles ending at visibleEnd
    const VISIBLE_COUNT = 40;
    const to = visibleEnd;
    const from = Math.max(0, visibleEnd - VISIBLE_COUNT + 1);
    chartsRef.current.forEach(c => c.timeScale().setVisibleLogicalRange({ from, to }));
    let crosshairSyncing = false;
    chartsRef.current.forEach((chart, chartIdx) => {
      chart.subscribeCrosshairMove((params: any) => {
        if (crosshairSyncing) return;
        if (!params.time) {
          crosshairSyncing = true;
          chartsRef.current.forEach((c, i) => { if (i !== chartIdx) c.clearCrosshairPosition(); });
          crosshairSyncing = false;
          handleCrosshairMove(params);
          return;
        }
        crosshairSyncing = true;
        const time = params.time as number;
        const dateStr = new Date(time * 1000).toISOString().slice(0, 10);
        const meta = metaMap.get(dateStr);
        chartsRef.current.forEach((otherChart, otherIdx) => {
          if (otherIdx === chartIdx) return;
          const rep = repSeriesRef.current[otherIdx];
          if (!rep) return;
          let price = 0;
          if (otherIdx === 0 && meta) price = meta.close;
          else if (otherIdx === 1 && meta?.kdj) price = meta.kdj.k;
          else if (otherIdx === 2 && meta?.macd) price = meta.macd.dif;
          else if (otherIdx === 3 && meta) price = meta.obv;
          else if (otherIdx === 4 && meta && meta.ma20 !== null) price = meta.ma20;
          otherChart.setCrosshairPosition(price, time as unknown as UTCTimestamp, rep);
        });
        crosshairSyncing = false;
        handleCrosshairMove(params);
      });
    });

    return () => {
      chartsRef.current.forEach(c => c.remove());
      chartsRef.current = [];
      seriesRef.current.clear();
      repSeriesRef.current = [];
      paneRefs.current.forEach(el => el.remove());
      paneRefs.current = [];
      labelRefs.current = [];
    };
  }, [allCandles, visibleEnd, indicators, handleCrosshairMove, dims]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="h-full" />
      <div ref={tooltipRef} className="hidden absolute z-10 pointer-events-none bg-[#111322]/95 border border-[#1f2235] rounded-lg px-3 py-2 text-xs text-gray-300 leading-relaxed whitespace-nowrap font-mono" style={{ minWidth: 260, backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
    </div>
  );
}
