import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Calendar,
  Sparkles,
  ArrowUpRight,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface DailyGrowthChartProps {
  userId: string;
  onRefresh?: () => void;
}

type TimeframeOption = 30 | 14 | 7;
type MetricMode = 'all' | 'views' | 'clicks' | 'cumulative';

// Catmull-Rom to Cubic Bezier curve path generator for ultra-smooth lines
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export const DailyGrowthChart: React.FC<DailyGrowthChartProps> = ({ userId, onRefresh }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>(30);
  const [metricMode, setMetricMode] = useState<MetricMode>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDemoAdded, setIsDemoAdded] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load trend data
  const trend = useMemo(() => {
    return StorageService.getDailyGrowthTrend(userId, timeframe);
  }, [userId, timeframe, isDemoAdded]);

  const { data, totalPeriodViews, totalPeriodClicks, avgDailyViews, peakDay, growthRate } = trend;

  // Chart Dimensions & Coordinate calculations
  const width = 800;
  const height = 280;
  const padding = { top: 25, right: 35, bottom: 45, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Determine Max Y value based on mode
  const maxVal = useMemo(() => {
    let highest = 0;
    data.forEach((d) => {
      if (metricMode === 'cumulative') {
        highest = Math.max(highest, d.cumulativeViews, d.cumulativeClicks);
      } else if (metricMode === 'views') {
        highest = Math.max(highest, d.views);
      } else if (metricMode === 'clicks') {
        highest = Math.max(highest, d.clicks);
      } else {
        highest = Math.max(highest, d.views, d.clicks);
      }
    });
    // Ensure minimum scale for aesthetic appeal
    return highest > 0 ? Math.ceil(highest * 1.15) : 5;
  }, [data, metricMode]);

  // Compute (x, y) coordinates for each day
  const points = useMemo(() => {
    const stepX = data.length > 1 ? graphWidth / (data.length - 1) : graphWidth;

    return data.map((d, i) => {
      // In RTL or standard charts, X progresses from left to right (chronological order)
      const x = padding.left + i * stepX;

      let viewsVal = d.views;
      let clicksVal = d.clicks;

      if (metricMode === 'cumulative') {
        viewsVal = d.cumulativeViews;
        clicksVal = d.cumulativeClicks;
      }

      const yViews = padding.top + graphHeight - (viewsVal / maxVal) * graphHeight;
      const yClicks = padding.top + graphHeight - (clicksVal / maxVal) * graphHeight;

      return {
        x,
        yViews: isNaN(yViews) ? padding.top + graphHeight : yViews,
        yClicks: isNaN(yClicks) ? padding.top + graphHeight : yClicks,
        data: d,
      };
    });
  }, [data, graphWidth, graphHeight, maxVal, metricMode]);

  // Generate SVG curve paths
  const viewsPath = useMemo(() => {
    return generateSmoothPath(points.map((p) => ({ x: p.x, y: p.yViews })));
  }, [points]);

  const clicksPath = useMemo(() => {
    return generateSmoothPath(points.map((p) => ({ x: p.x, y: p.yClicks })));
  }, [points]);

  // Generate Area Fill paths (closed to bottom)
  const bottomY = padding.top + graphHeight;
  const viewsAreaPath = useMemo(() => {
    if (points.length < 2) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${viewsPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [viewsPath, points, bottomY]);

  const clicksAreaPath = useMemo(() => {
    if (points.length < 2) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${clicksPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [clicksPath, points, bottomY]);

  // Pointer interactions
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scale = width / rect.width;
    const svgX = clientX * scale;

    let closestIdx = 0;
    let closestDist = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  // Generate Demo Data for testing
  const handleGenerateDemoData = () => {
    StorageService.seedDemoAnalytics(userId, 40);
    setIsDemoAdded(true);
    if (onRefresh) onRefresh();
  };

  // Active hover point
  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 font-cairo text-right transition-all">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              مخطط النمو اليومي للزوار والتفاعل ({timeframe} يوماً)
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>رسم بياني خطي تفاعلي</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تتبع وتيرة الزيارات اليومية وتفاعل النقرات على الروابط لاكتشاف أوقات الذروة ونمو المتابعين
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 30
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              آخر 30 يوماً
            </button>
            <button
              type="button"
              onClick={() => setTimeframe(14)}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 14
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              14 يوماً
            </button>
            <button
              type="button"
              onClick={() => setTimeframe(7)}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeframe === 7
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7 أيام
            </button>
          </div>

          {/* Metric Selector */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetricMode('all')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                metricMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>الكل</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('views')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                metricMode === 'views'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>الزيارات</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('clicks')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                metricMode === 'clicks'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>النقرات</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('cumulative')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                metricMode === 'cumulative'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>تراكمي</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Trend Highlights (4 Quick Insights) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total in Period */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>إجمالي زوار {timeframe} يوماً</span>
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {totalPeriodViews.toLocaleString('ar-SA')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            مقابل {totalPeriodClicks} نقرة رابط
          </div>
        </div>

        {/* Daily Average */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>متوسط الزيارات اليومي</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {avgDailyViews}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            معدل زيارة لكل 24 ساعة
          </div>
        </div>

        {/* Peak Day */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>أعلى ذروة تفاعل</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {peakDay ? peakDay.views : 0} <span className="text-xs font-normal text-slate-400">زيارة</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {peakDay && peakDay.views > 0 ? peakDay.displayDate : 'بانتظار الزيارات'}
          </div>
        </div>

        {/* Growth Momentum */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>معدل نمو التفاعل</span>
            {growthRate >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${
                growthRate > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : growthRate < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            مقارنة بالنصف السابق للفترة
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Line Chart */}
      <div className="relative w-full rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 p-2 sm:p-4 overflow-hidden">
        {/* Chart Legend */}
        <div className="flex items-center justify-between px-2 pt-1 pb-3 text-xs">
          <div className="flex items-center gap-4">
            {(metricMode === 'all' || metricMode === 'views' || metricMode === 'cumulative') && (
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                <span>مشاهدات الصفحة (Visitors)</span>
              </div>
            )}
            {(metricMode === 'all' || metricMode === 'clicks' || metricMode === 'cumulative') && (
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500/50" />
                <span>نقرات الروابط (Clicks)</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            مرر المؤشر أو المس المنحنى لعرض التفاصيل اليومية الدقيقة
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full relative touch-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <defs>
              {/* Emerald Gradient for Views */}
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Indigo Gradient for Clicks */}
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>

              {/* Drop Shadow Filter for Lines */}
              <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
              </filter>
              <filter id="glowIndigo" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis values */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + graphHeight - ratio * graphHeight;
              const value = Math.round(ratio * maxVal);

              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray={ratio === 0 ? '0' : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            {(metricMode === 'all' || metricMode === 'views' || metricMode === 'cumulative') && viewsAreaPath && (
              <path d={viewsAreaPath} fill="url(#emeraldGradient)" />
            )}

            {(metricMode === 'all' || metricMode === 'clicks' || metricMode === 'cumulative') && clicksAreaPath && (
              <path d={clicksAreaPath} fill="url(#indigoGradient)" />
            )}

            {/* Lines */}
            {(metricMode === 'all' || metricMode === 'views' || metricMode === 'cumulative') && viewsPath && (
              <path
                d={viewsPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glowEmerald)"
              />
            )}

            {(metricMode === 'all' || metricMode === 'clicks' || metricMode === 'cumulative') && clicksPath && (
              <path
                d={clicksPath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glowIndigo)"
              />
            )}

            {/* X-Axis Tick Labels (Sensible intervals based on timeframe) */}
            {points.map((p, idx) => {
              // Display label interval: every 5 days for 30d, every 2 days for 14d, every day for 7d
              const interval = timeframe === 30 ? 5 : timeframe === 14 ? 2 : 1;
              const isFirst = idx === 0;
              const isLast = idx === points.length - 1;
              const shouldShow = isFirst || isLast || idx % interval === 0;

              if (!shouldShow) return null;

              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 15}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-400 dark:fill-slate-500 font-sans"
                >
                  {p.data.displayDate}
                </text>
              );
            })}

            {/* Hover Crosshair & Data Points */}
            {activePoint && (
              <g>
                {/* Vertical Guideline */}
                <line
                  x1={activePoint.x}
                  y1={padding.top}
                  x2={activePoint.x}
                  y2={bottomY}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="opacity-70 dark:opacity-40"
                />

                {/* Dot for Views */}
                {(metricMode === 'all' || metricMode === 'views' || metricMode === 'cumulative') && (
                  <g>
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.yViews}
                      r="6"
                      fill="#10b981"
                      className="animate-ping opacity-75"
                    />
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.yViews}
                      r="5.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  </g>
                )}

                {/* Dot for Clicks */}
                {(metricMode === 'all' || metricMode === 'clicks' || metricMode === 'cumulative') && (
                  <g>
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.yClicks}
                      r="5.5"
                      fill="#6366f1"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  </g>
                )}
              </g>
            )}
          </svg>

          {/* Interactive Floating Tooltip Card */}
          {activePoint && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-75"
              style={{
                left: `${(activePoint.x / width) * 100}%`,
                top: `${Math.min(activePoint.yViews, activePoint.yClicks) / 1.4}px`,
                transform: `translate(${activePoint.x > width * 0.75 ? '-100%' : activePoint.x < width * 0.25 ? '0%' : '-50%'}, -105%)`,
              }}
            >
              <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl p-3 min-w-[170px] text-right space-y-2">
                <div className="text-[11px] font-bold text-slate-300 border-b border-slate-700/60 pb-1.5 flex items-center justify-between">
                  <span>{activePoint.data.weekday}</span>
                  <span className="text-amber-400 font-mono">{activePoint.data.displayDate}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>مشاهدات الزوار:</span>
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {metricMode === 'cumulative' ? activePoint.data.cumulativeViews : activePoint.data.views}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>نقرات الروابط:</span>
                    </span>
                    <span className="font-mono font-black text-indigo-400 text-sm">
                      {metricMode === 'cumulative' ? activePoint.data.cumulativeClicks : activePoint.data.clicks}
                    </span>
                  </div>

                  {activePoint.data.views > 0 && (
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-700/50 text-[10px] text-slate-400">
                      <span>معدل النقر (CTR):</span>
                      <span className="font-mono font-bold text-amber-300">
                        {((activePoint.data.clicks / activePoint.data.views) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty / Low Data Helper Banner */}
        {totalPeriodViews === 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                لم يتم تسجيل زيارات في آخر {timeframe} يوماً بعد. شارك رابط صفحتك أو اختبر المنحنى فوراً!
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateDemoData}
              className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] transition shadow-xs shrink-0 self-start sm:self-auto"
            >
              💡 محاكاة بيانات تفاعل تجريبية لمعاينة المنحنى
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
