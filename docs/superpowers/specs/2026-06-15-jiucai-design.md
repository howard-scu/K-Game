# 韭菜大冒险 设计文档

## 概述

**韭菜大冒险** —— 一款K线盘感训练 Web 游戏。用户模拟买卖交易，在逐根揭示的 K 线行情中决策，比拼收益率与多维度操盘评分。

## 技术栈

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18 + Vite | 状态驱动游戏流程，组件化 |
| 图表 | TradingView Lightweight Charts | 轻量（50KB），多 pane 实例堆叠实现主图+附图 |
| 样式 | Tailwind CSS | 快速出界面，与 React 组件化配合好 |
| 部署 | 静态站点（Vercel / GitHub Pages） | 纯前端，零服务器成本 |
| 数据 | 离线 CSV 浏览器端解析 | 76 个 CSV 文件，无需后端 |

## 数据

`data/` 目录下两种 CSV 格式：

**ETF 类（如 510210_上证综指ETF.csv）**
- 字段顺序：`date,open,close,high,low,volume,amount,...`
- **注意：OHLC 为 open→close→high→low（非标准），解析时务必按此顺序**

**个股类（如 sh603222_济民健康_前复权.csv）**
- 首列为无名索引列（0,1,2...），解析时需跳过
- 字段顺序：`索引,date,open,high,low,close,volume,amount,...`
- OHLC 为 open→high→low→close（标准顺序）

两者的核心 OHLC 列名一致（open/close/high/low），解析后统一为内部 KLine 类型。

对标基准固定为 `510210_上证综指ETF.csv`。

## 组件架构

```
App
├── TitleScreen          // 开始界面
│   ├── 股票选择器（从 data/ 加载 CSV 列表）
│   ├── K线根数滑块（10~60 根，默认 30）
│   └── 开始按钮
│
├── GameScreen           // 游戏主界面（左右布局）
│   ├── ChartPanel       // 左：多 pane 图表
│   │   ├── MainPane     // K线 + 均线(MA5/20/60) + 大盘叠加线
│   │   ├── VolPane      // 成交量柱 (附 MA5/20 均量线)
│   │   ├── MACDPane     // MACD (DIF/DEA/柱)
│   │   ├── KDJPane      // KDJ (K/D/J 三线)
│   │   └── ATRPane      // ATR 线
│   │
│   └── ControlPanel     // 右：操作面板
│       ├── 当前持仓信息（股数/成本价/浮盈）
│       ├── 进度显示（第 N / 总根数）
│       ├── 仓位选择（25%/50%/75%/满仓）
│       ├── 操作按钮（买入/加仓/减仓/卖出/观望）
│       └── 账户栏（可用资金/总资产/累计收益）
│
└── ResultScreen         // 结算界面
    ├── 综合评级（S/A/B/C/D）
    ├── 评分雷达图（5 维度）
    ├── vs 大盘对比
    └── 再来一局
```

## 状态管理

使用 React Context + useReducer：

```typescript
interface GameState {
  phase: 'welcome' | 'playing' | 'result';
  stock: { symbol: string; name: string; candles: KLine[] };
  benchmark: KLine[];          // 510210 同期数据
  settings: { candleCount: number };
  currentIndex: number;
  cash: number;                 // 初始 100,000
  positions: Position[];        // 持仓记录
  history: Action[];            // 操作历史
  score: Score | null;
}
```

## 游戏流程

1. **TitleScreen** → 用户选股、调K线根数 → 点击开始
2. 加载 CSV，随机截取连续片段（含基准指数同期数据），显示第 1 根 K 线
3. **GameScreen** → 每次用户操作后 `currentIndex++`，显示下一根
4. 重复直到 `currentIndex === candleCount - 1` → 进入结算
5. **ResultScreen** → 展示评分，可再来一局

## 交易规则

| 项目 | 设定 |
|------|------|
| 初始资金 | 100,000（固定） |
| 买入仓位 | 可用资金的 25% / 50% / 75% / 满仓 |
| 卖出仓位 | 持仓股数的 25% / 50% / 75% / 清仓 |
| 成交价 | 当前 K 线收盘价 |
| 手续费 | 暂不计（后续可加） |
| 多空限制 | 仅做多 |

## 评分系统

| 维度 | 计算方式 | 权重 |
|------|----------|------|
| 总收益率 | (最终总资产 − 100000) / 100000 × 100% | 30% |
| vs 大盘 | 用户收益率 − 同期 510210 收益率 | 20% |
| 胜率 | 盈利交易次数 / 总交易次数 | 20% |
| 盈亏比 | 平均盈利 / 平均亏损 | 15% |
| 最大回撤 | 总资产从峰值到谷底的最大跌幅 | 15% |

各维度原始分映射到百分制后加权求和 → S(≥90)/A(≥75)/B(≥60)/C(≥40)/D。

## 技术指标

### 主图指标（叠加在 K 线上方）

| 指标 | 参数 | 计算方式 | 渲染 |
|------|------|----------|------|
| MA5 | 5 日 | 收盘价简单移动平均 | Lightweight Charts LineSeries |
| MA20 | 20 日 | 收盘价简单移动平均 | LineSeries |
| MA60 | 60 日 | 收盘价简单移动平均 | LineSeries |

### 附图指标（独立 pane）

**成交量（VolPane）**
- 柱状图，涨红跌绿
- 叠加 MA5 / MA20 均量线

**MACD（MACDPane）**
- DIF = EMA12 − EMA26
- DEA = EMA9(DIF)
- 柱（MACD）= 2 × (DIF − DEA)
- DIF/DEA 以 LineSeries 渲染，柱以 HistogramSeries 渲染

**KDJ（KDJPane）**
- RSV = (收盘价 − 最低9日) / (最高9日 − 最低9日) × 100
- K = 2/3 × 前K + 1/3 × RSV
- D = 2/3 × 前D + 1/3 × K
- J = 3K − 2D
- K/D/J 三线以 LineSeries 渲染

**ATR（ATRPane）**
- TR = max(高−低, |高−前收|, |低−前收|)
- ATR = 前ATR × 13 + TR / 14（指数移动）
- 以 LineSeries 渲染

所有指标在 `lib/indicators.ts` 中实现为纯函数，输入 `KLine[]`，输出对应数据数组。逐根揭示时只需计算到 `currentIndex` 即可。

## UI 布局

左右结构（桌面优先）：
- **左侧（flex: 7）**：多 pane 图表（主图 + 4 个附图堆叠） + 底部操作记录条
- **右侧（flex: 3）**：账户信息 + 持仓 + 仓位选择 + 操作按钮

顶部状态栏：股票名称 | 进度 N/M | 可用资金 | 总资产

图表区域五个 pane 垂直排列，crosshair 同步联动（Lightweight Charts 的 `crosshairMove` 事件驱动各实例同步）。

## 项目结构

```
k-game/
├── public/
│   └── data/                    // CSV 文件（构建时复制）
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── TitleScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── ChartPanel.tsx
│   │   ├── ControlPanel.tsx
│   │   └── ResultScreen.tsx
│   ├── hooks/
│   │   ├── useGameState.ts      // 游戏状态机
│   │   ├── useStockData.ts      // 加载解析 CSV
│   │   └── useScoring.ts        // 评分计算
│   ├── lib/
│   │   ├── parser.ts            // CSV 解析器（处理两种格式）
│   │   ├── indicators.ts        // 技术指标计算（MA/MACD/KDJ/ATR）
│   │   ├── trading.ts           // 交易逻辑（买卖/持仓计算）
│   │   ├── scoring.ts           // 评分算法
│   │   └── types.ts             // 类型定义
│   ├── data/
│   │   └── index.ts             // 导入所有 CSV 的清单
│   └── main.tsx
├── vite.config.ts
└── package.json
```
