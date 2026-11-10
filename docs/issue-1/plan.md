# Implementation Plan: Issue #1 坦克大战

## Overview
纯前端单页坦克大战：数据驱动网格地图 + AABB 碰撞 + Canvas 渲染。核心规则封装在无 DOM 依赖的 `game.js` 中，渲染与输入由 `index.html` 内联模块驱动，保证既能浏览器即开即玩，又能在 Node 下做单元测试。

## Architecture Decisions
- **Canvas 2D 而非 DOM/WebGL**：经典街机风格，实现简单，性能足够。
- **ES Module 无构建**：浏览器原生 `<script type="module">`，零依赖。
- **逻辑与渲染分离**：`game.js` 接收 `dt/input` 推进状态，`render.js` 只读状态绘制；测试可无 Canvas 运行。
- **数据驱动地图**：字符网格（`.` 空地、`B` 砖墙、`S` 钢墙、`E` 基地）多关卡配置在 `config.js`。
- **网格 13×13 + 32px 格子**：Canvas 416×416，坦克 28px 可在单格通道内通行。
- **测试 seam**：`collision.js`、`map.js`、`ai.js`、`game.js` 公开函数/方法与状态字段；不测 Canvas 绘制。

## 依赖顺序
config → collision/map → tank/bullet → ai → game → render → index.html/style.css

## Task List

### Phase 1: 基础逻辑（TDD 红→绿）
- [x] Task 1: 碰撞与地图（AABB、网格解析、砖墙可毁、钢墙/基地）
- [x] Task 2: 坦克/子弹实体与移动判定
- [x] Task 3: 敌方 AI 方向选择

### Checkpoint: 基础
- [x] `node --test tests/*.test.js` 全绿
- [x] 纯逻辑模块无 DOM 依赖

### Phase 2: 游戏状态机
- [x] Task 4: 主循环 `Game`（移动/开火/命中/计分/敌人刷新/关卡推进/失败重开）

### Checkpoint: 核心
- [x] 状态机测试全绿（击毁得分、清关推进、基地/生命失败）

### Phase 3: 表现层
- [x] Task 5: Canvas 渲染 + HUD + 输入 + 页面样式
- [x] Task 6: 一次性 HTTP 运行验证 + 手动验收

### Checkpoint: 完成
- [x] 全部验收标准满足
- [x] `node --test tests/*.test.js` 全绿

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| 高速子弹穿墙 | Med | 子弹按小步长推进并逐段检测格子 |
| 坦克卡墙 | Med | 轴对齐移动 + AABB 逐轴判定 |
| 敌方 AI 原地抖动 | Low | 方向惯性 + 随机扰动 + 目标偏向 |
| 无浏览器自动化测试 | Low | Node 单测覆盖逻辑 + 一次性 HTTP 验证 + 手动清单 |

## Open Questions
无。