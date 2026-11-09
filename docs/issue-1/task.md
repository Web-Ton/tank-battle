# Task List: Issue #1 坦克大战

- [ ] Task 1: 碰撞与地图逻辑
  - Acceptance: AABB 相交/边界判断正确；砖墙可被击毁、钢墙不可毁、基地可被毁；非法字符报错。
  - Verify: `node --test tests/collision.test.js tests/map.test.js`
  - Files: `js/config.js`, `js/collision.js`, `js/map.js`, `tests/collision.test.js`, `tests/map.test.js`

- [ ] Task 2: 坦克与子弹实体
  - Acceptance: 坦克按方向移动、世界/墙体/其它坦克阻挡；子弹有归属与方向。
  - Verify: `node --test tests/tank.test.js`
  - Files: `js/tank.js`, `js/bullet.js`, `tests/tank.test.js`

- [ ] Task 3: 敌方 AI
  - Acceptance: 朝玩家/基地方向选择可行方向，被挡时转向，支持射击决策。
  - Verify: `node --test tests/ai.test.js`
  - Files: `js/ai.js`, `tests/ai.test.js`

- [ ] Task 4: 游戏状态机
  - Acceptance: 玩家移动/开火；子弹击毁砖墙与敌人并计分；基地被毁或生命耗尽 → lost；敌人清空 → levelclear → 下一关累计得分；restart 重置。
  - Verify: `node --test tests/game.test.js`
  - Files: `js/game.js`, `js/config.js`, `tests/game.test.js`

- [ ] Task 5: 渲染与页面
  - Acceptance: 页面打开即显示地图/坦克/子弹/HUD；键盘控制；失败提示与重开。
  - Verify: 一次性 HTTP 验证 + 手动检查
  - Files: `index.html`, `style.css`, `js/render.js`

- [ ] Task 6: 运行验证
  - Acceptance: `python3 -m http.server` 后台启动后 curl 返回 200 与页面内容，进程被清理。
  - Verify: `python3 -m http.server 8080 >/tmp/httpd.log 2>&1 & sleep 1; curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/; kill %1`
  - Files: 无（验证）