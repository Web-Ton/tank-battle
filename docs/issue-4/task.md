# Task List: Issue #4 关卡数据驱动与剩余敌数 HUD

- [x] Task 1: 关卡配置数据化
  - Acceptance: `LEVELS.length === 10`，每关 `enemyTotal === 20`、13×13 地图、唯一基地 `E` 与出生点 `p`、地图互不重复；`MAX_ACTIVE_ENEMIES === 4`；`enemyTotalForLevel(i)` 越界返回 0 不回绕。
  - Verify: `node --test tests/config.test.js`
  - Files: `js/config.js`, `tests/config.test.js`

- [x] Task 2: 游戏状态机按配置派生
  - Acceptance: `level` 越界为 `null`；`isFinalLevel` / `levelCount` 正确；`remainingEnemies` 为唯一剩余口径；`spawnEnemy()` 达 4 辆返回 false 且不递减队列；最终关清场进入 `STATE_ALL_CLEAR` 且 `nextLevel()` 不递增；`restart()` 按配置重置敌数。
  - Verify: `node --test tests/game.test.js`
  - Files: `js/game.js`, `tests/game.test.js`

- [x] Task 3: HUD 与通关结算
  - Acceptance: HUD 显示「剩余」敌数并随生成/击毁递减；关卡项显示「第 N/10 关 · 名称」；`STATE_ALL_CLEAR` 显示结算遮罩并支持 Enter/R 重开；四项单行不溢出 416px。
  - Verify: 一次性 HTTP 验证 + 手动检查
  - Files: `index.html`, `style.css`

- [x] Task 4: 文档与说明一致
  - Acceptance: README 与 HUD 的「本期 10 关」表述一致，写明每关 20 辆、同屏 4。
  - Verify: 人工核对
  - Files: `README.md`, `docs/issue-4/*.md`

- [x] Task 5: 全量回归
  - Acceptance: `node --test tests/*.test.js` 全量通过，输出附在 PR 描述。
  - Verify: `node --test tests/*.test.js`
