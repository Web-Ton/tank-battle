# Implementation Plan: Issue #4 关卡数据驱动与剩余敌数 HUD

## Overview
把「敌数公式 + 取模选图」替换为 `LEVELS` 单一数据源：配置 → 状态派生 → HUD 展示。逻辑仍集中在无 DOM 依赖的 `game.js`，页面只读取状态渲染。

## Architecture Decisions
- **单一数据源**：关卡名称、地图、敌数全部来自 `LEVELS`；`enemyTotalForLevel` 只做索引校验与读取，不再用涨关公式推算。
- **越界即失效**：`levelIndex` 越界时 `level` 返回 `null`、敌数返回 `0`，从根上消灭「取模复用同一张图」。
- **最终关新增状态**：`STATE_ALL_CLEAR` 与 `STATE_CLEAR` 分离，`update()` 对非 `PLAYING` 状态提前返回，结算后状态冻结，不回到第 1 关。
- **剩余敌数唯一口径**：`remainingEnemies = spawnQueue + enemies.length`，生成不额外计数、击毁自然递减，归零即清关。
- **不动 #3 范围**：保留 `STATE_CLEAR` 的 1.2s 自动推进逻辑与既有 R 键语义，仅给 `STATE_ALL_CLEAR` 新增 Enter/R 重开。

## 依赖顺序
config → game → index.html/style.css → README → tests

## Task List

### Phase 1: 配置与测试基线
- [x] Task 1: `js/config.js` 扩为 10 关数据 + `enemyTotal`，`MAX_ACTIVE_ENEMIES = 4`，`enemyTotalForLevel` 读配置且越界返回 0
- [x] Task 2: 新增 `tests/config.test.js`（关卡数量/敌数/地图维度/唯一基地与出生点/地图互不重复/可达性）

### Checkpoint: 配置
- [x] `node --test tests/config.test.js` 全绿

### Phase 2: 状态机
- [x] Task 3: `js/game.js` 去取模、加 `isFinalLevel`/`levelCount`/`STATE_ALL_CLEAR`，`nextLevel` 最终关不递增，`restart` 按配置重置
- [x] Task 4: 扩充 `tests/game.test.js`（越界、同屏上限、剩余计数、最终关结算、重开敌数）

### Checkpoint: 状态机
- [x] `node --test tests/game.test.js` 全绿

### Phase 3: 表现层与文档
- [x] Task 5: `index.html` + `style.css` HUD 剩余敌数与「第 N/10 关 · 名称」，通关结算遮罩
- [x] Task 6: `README.md` 如实写明每关 20 辆 / 同屏 4 / 本期 10 关

### Checkpoint: 完成
- [x] `node --test tests/*.test.js` 全量通过
- [x] 一次性 HTTP 运行验证（后台启动 + curl + kill）
- [x] 自审查五轴通过
