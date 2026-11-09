# Spec: Issue #1 — 坦克大战开发

## Objective
在 `Web-Ton/tank-battle` 仓库从零实现一款 Battle City 风格的单机坦克大战游戏。浏览器打开 `index.html` 即可游玩，无需后端、无需构建步骤。

## Tech Stack
- HTML5 Canvas 2D + 原生 JavaScript（ES Module）
- 无框架、无第三方运行时依赖、无打包器
- 测试：Node.js 内置 `node:test`（仅用于纯逻辑模块）

## Commands
```bash
# 运行（本地）
python3 -m http.server 8080     # 浏览器打开 http://localhost:8080/
# 测试
node --test tests/
# 一次性运行验证
python3 -m http.server 8080 >/tmp/httpd.log 2>&1 & sleep 1; curl -s http://localhost:8080/ | head -20; kill %1
```

## Project Structure
```
index.html          → 页面、Canvas、HUD、入口模块
style.css           → 页面基础样式
js/config.js        → 常量、方位、关卡数据
js/collision.js     → AABB 碰撞与移动判定
js/map.js           → 网格地图、墙体/基地实体
js/tank.js          → 坦克实体
js/bullet.js        → 子弹实体
js/ai.js            → 敌方 AI 方向/射击决策
js/game.js          → 主循环逻辑与状态机（不依赖 DOM）
js/render.js        → Canvas 渲染
tests/              → 纯逻辑单元测试
docs/issue-1/       → 本 Issue 文档
```

## Code Style
- ES Module，具名导出；模块单一职责。
- 逻辑与渲染分离：`game.js` 不引用 `document`/`canvas`，便于 Node 测试。
- 坐标统一使用像素矩形 `{x, y, w, h}`，碰撞统一 AABB。
- 常量集中在 `config.js`，不在业务代码写魔法数字。

## Testing Strategy
- 框架：`node:test`，测试位于 `tests/*.test.js`。
- 覆盖纯逻辑 seam：碰撞判定、地图解析/破坏、AI 方向选择、游戏状态机（移动/开火/计分/关卡推进/失败）。
- 渲染与 DOM 交互通过一次性 HTTP 验证 + 手动验收清单确认。

## Boundaries
- Always: 保持零依赖可打开即玩；所有新逻辑有对应测试；提交前跑 `node --test`。
- Ask first: 引入第三方依赖、改变架构分层。
- Never: 提交密钥/内网地址；引入后端或构建链；修改 Issue 范围外功能。

## Success Criteria
- [x] 打开 `index.html` 即可开始，无需安装/后端
- [x] 玩家四向移动、开火，子弹/坦克/墙体碰撞正确
- [x] 敌方 AI 巡逻并向玩家/基地射击
- [x] 基地被毁或生命耗尽判定失败，可重开
- [x] 清空关卡敌人后进入下一关并累计得分
- [x] HUD 显示得分、生命、关卡

## Open Questions
无（按 Web / Canvas / 单机默认假设推进）。