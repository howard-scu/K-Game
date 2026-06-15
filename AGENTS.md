# K-GAME — K线盘感训练游戏

## 项目状态

代码未开始，`data/` 目录已有 76 个离线 CSV 数据文件。待确定前端框架（Web/小程序/桌面）后开始实现。

## 数据文件

`data/` 下两种 CSV 格式：

**ETF 类**（如 `510210_上证综指ETF.csv`）
- 字段：`date,open,close,high,low,volume,amount,amplitude,pct_chg,change,turnover,symbol,name`
- **注意：OHLC 顺序为 open→close→high→low（非标准），解析时务必按此顺序**
- volume 单位较小（疑似万股）

**个股前复权**（如 `sh603222_济民健康_前复权.csv`）
- 字段：无名列(索引),`date,open,high,low,close,volume,amount,outstanding_share,turnover,股票代码,股票名称`
- **首列为未命名索引列（0,1,2...），解析时需跳过**
- OHLC 顺序为 open→high→low→close（标准顺序）

两种格式共有的核心 OHLC 列名均为小写英文，可直接用于生成 K 线。

## 约定

- 专注核心训练机制：K线渲染、模式识别题目、评分反馈
- 数据优先使用真实历史行情（`data/` 目录离线 CSV）
- 游戏化设计（连胜、计时、难度梯度）
