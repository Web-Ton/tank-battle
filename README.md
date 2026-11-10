# tank-battle

经典 Battle City 风格的单机坦克大战：HTML5 Canvas + 原生 JS，零后端、零构建，浏览器打开即玩。

## 运行

直接用浏览器打开 `index.html`，或在仓库根目录启动静态服务器：

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080/
```

> 使用 ES Module，需要现代浏览器（Chrome / Edge / Firefox / Safari 最新版）；直接以 `file://` 打开时部分浏览器会拦截模块加载，推荐用本地静态服务器。

## 操作

- `↑` `↓` `←` `→`：移动坦克
- `空格`：开火
- `Enter`：失败后重新开始

## 玩法

- 击毁敌方坦克得分（每辆 100 分），消灭当前关卡全部敌人后自动进入下一关并累计得分。
- 基地（金色老鹰）被敌方炮弹击毁，或玩家生命耗尽，游戏失败。
- HUD 显示得分、生命与当前关卡。

## 测试

纯逻辑模块使用 Node.js 内置测试框架：

```bash
node --test tests/*.test.js
```

## 结构

```
index.html     页面、Canvas、HUD、入口模块
style.css      页面样式
js/config.js   常量与关卡数据
js/collision.js AABB 碰撞判定
js/map.js      网格地图与墙体/基地
js/tank.js     坦克实体
js/bullet.js   子弹实体
js/ai.js       敌方 AI 决策
js/game.js     游戏状态机（无 DOM 依赖）
js/render.js   Canvas 渲染
tests/         纯逻辑单元测试
```