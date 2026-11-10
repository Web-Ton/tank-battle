# Spec: Issue #4 — 关卡内容对齐经典 Battle City

## Objective
把硬编码的关卡参数改为数据驱动的 10 关配置：每关总敌数 20、同屏上限 4；HUD 实时显示本关剩余敌坦克数，归零触发清关；最终关清场进入通关结算（`STATE_ALL_CLEAR`），不再无声循环回第 1 关。

## 背景与根因
main @ 008e344 事实：

- `enemyTotalForLevel(i) = 4 + i * 2` → 第 1 关仅 4 辆敌方坦克；
- `MAX_ACTIVE_ENEMIES = 3` → 低于经典同屏上限 4；
- `LEVELS` 仅 3 张手写地图，`Game.level` getter 用 `LEVELS[this.levelIndex % LEVELS.length]` 取模复用 → 关卡无限循环同一批地图。

## Scope

### In Scope
- `js/config.js`：`LEVELS` 扩为 10 关（每关 `name` / `enemyTotal: 20` / `grid`，13×13，各含 1 个基地 `E` 与出生点 `p`，1–3 关沿用前哨/迷宫/钢堡，4–10 关新增且互不重复）；`MAX_ACTIVE_ENEMIES = 4`；`enemyTotalForLevel(i)` 读取配置，越界返回 0（禁止取模回绕）。
- `js/game.js`：`level` getter 去掉取模、越界返回 `null`；新增 `isFinalLevel`、`levelCount` 与 `STATE_ALL_CLEAR`；`nextLevel()` 在最终关不递增；`restart()` 按配置重置 `enemyTotal`；`remainingEnemies = spawnQueue + 场上敌数` 作为唯一口径；`checkLevelClear()` 按是否最终关分流到 `STATE_CLEAR` / `STATE_ALL_CLEAR`。
- `index.html` + `style.css`：HUD 增加「剩余」敌数，关卡项显示「第 N/10 关 · 名称」；`STATE_ALL_CLEAR` 结算遮罩（Enter / R 重开）。
- `README.md`：如实写明每关 20 辆、同屏 4、本期 10 关（目标 35 关后续扩充）。
- 测试：新增 `tests/config.test.js`，扩充 `tests/game.test.js`。

### Out of Scope
- 关卡推进链路缺陷（`STATE_CLEAR` 后不进入下一关、R 键绑定、rAF 中断）归 Issue #3；本 Issue 不修改 `STATE_CLEAR` 的 1.2s 自动推进逻辑。
- 敌人 AI、美术、音效、移动端触控、存档。
- 35 关全量地图（本期 10 关，配置数组预留扩展位）。

## Technical Approach
关卡参数从函数公式改为 `LEVELS` 单一数据源，敌数 / 同屏上限 / HUD 全部由该数据派生，地图不再取模复用。

1. `config.js`：`LEVELS` 每项加 `enemyTotal: 20` 并扩到 10 关；`MAX_ACTIVE_ENEMIES = 4`；`enemyTotalForLevel(levelIndex)` 仅接受 `[0, LEVELS.length)` 内的整数，否则返回 0。
2. `game.js`：`get level()` → `LEVELS[this.levelIndex] ?? null`；`get isFinalLevel()` → `this.levelIndex >= LEVELS.length - 1`；`get levelCount()` → `LEVELS.length`；`checkLevelClear()` 在队列与场上同时归零时按 `isFinalLevel` 置 `STATE_ALL_CLEAR` 或 `STATE_CLEAR`；`nextLevel()` 在最终关返回 `false` 且不递增；`restart()` 回 0 关并按配置重置 `enemyTotal`。
3. `index.html`：HUD 增加 `<strong id="remaining">`；`updateHud()` 写入 `game.remainingEnemies` 与「第 N/10 关 · 名称」；新增 `STATE_ALL_CLEAR` 遮罩（「全部关卡完成」+ Enter/R 重开）。
4. `style.css`：HUD 四项单行布局，416px 宽内不溢出。
5. `tests/` 与 `README.md` 同步更新。

### 关键设计决策
| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 本期关卡数 | 3 / 10 / 35 | 10 | VOD 建议首期 10 关；满足「≥3 关连续可玩」并留扩展余量 |
| 敌数来源 | 函数公式 / 配置字段 | 配置字段 `enemyTotal` | 需求要求数据驱动，禁止写死 |
| 越界语义 | 取模回绕 / 返回 0 与 null | 返回 0 与 null | 取模正是「只有一张地图循环」的根因 |
| 最终关表现 | 继续循环 / 新增结算态 | `STATE_ALL_CLEAR` | 消除无声循环 |

## Affected Modules
| 模块 | 改动类型 | 说明 |
|------|---------|------|
| js/config.js | 修改 | LEVELS 10 关 + enemyTotal、MAX_ACTIVE_ENEMIES=4、enemyTotalForLevel 读配置 |
| js/game.js | 修改 | level / isFinalLevel / levelCount、nextLevel / restart、STATE_ALL_CLEAR、checkLevelClear |
| index.html | 修改 | HUD 剩余敌数 + 关卡「N/10」、通关结算遮罩 |
| style.css | 修改 | HUD 四项布局 |
| README.md | 修改 | 关卡数 / 敌数 / 同屏上限如实说明 |
| tests/config.test.js | 新增 | 关卡配置与敌数派生 |
| tests/game.test.js | 修改 | 剩余计数、同屏上限、最终关 |

## Acceptance Criteria
- [ ] `LEVELS.length === 10`，每关 `enemyTotal === 20`；第 1 关开局 HUD「剩余」显示 20 并递减，归零后进入清关态。
- [ ] 任意时刻 `enemies.length ≤ 4`；`spawnEnemy()` 达到 4 时返回 false 且不递减 `spawnQueue`。
- [ ] 关卡 N 的地图与配置一致；`levelIndex` 越界时 `level` 为 null、敌数为 0，不存在取模复用。
- [ ] 第 10 关清场 → `STATE_ALL_CLEAR` 通关结算，不回到第 1 关。
- [ ] `node --test tests/*.test.js` 全量通过，PR 附实际输出。
- [ ] README 与 HUD 的「本期 10 关」表述一致。
- [ ] 与 #3 联动验收：清关计数归零 → 自动进入下一关；#3 未落地则本 Issue 不关闭。

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| 与 #3 并行修改 `game.js`/`index.html` 冲突 | High | 交集仅限 `STATE_CLEAR` 1.2s 推进逻辑，本 Issue 不改；合入冲突以本 Spec 为准 |
| 新增 7 张地图存在不可达或缺基地 | Med | 测试断言每关 13×13、互不重复、唯一 `E` 与 `p`、出生点到基地可达 |
| 出生点全被占用导致生成卡住 | Med | 保留 `ENEMY_SPAWNS` 轮换与 2s 重试，失败不递减队列；测试断言队列不为负 |
| 同屏 4 辆使难度陡增 | Low | 仅改上限常量，不动 AI 与射击冷却 |
