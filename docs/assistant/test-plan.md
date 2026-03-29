# 测试计划

## 前端手测

- 首页松小暖默认出现在右下角
- 拖动小人后松手吸边
- 刷新页面后位置保持不变
- 轻点打开聊天面板
- 首屏快捷问题可发送
- 输入框可发送自由文本
- 助手回复过程中显示加载状态
- 后端异常时显示失败和重试

## 后端接口测试

- `POST /auth/demo-login`
- `GET /me`
- `GET /institutions`
- `GET /institutions/{id}`
- `GET /elders/{id}/health/summary`
- `GET /elders/{id}/health/metrics`
- `GET /elders/{id}/dynamics`
- `POST /dynamics/{id}/like`
- `POST /dynamics/{id}/comments`
- `GET /elders/{id}/service-logs`
- `GET /orders`
- `POST /orders/sign`
- `POST /orders/{id}/reviews`
- `POST /assistant/sessions`
- `GET /assistant/sessions/{id}`
- `GET /assistant/sessions/{id}/messages`
- `POST /assistant/sessions/{id}/messages`

## 数据库验证

- PostgreSQL 实例成功启动
- `alembic upgrade head` 成功
- seed 成功写入全部示例数据
- 重复执行 seed 不会破坏关键引用

## CI 验证

- Node 依赖安装通过
- 前端构建通过
- Python 依赖安装通过
- PostgreSQL service 可用
- 后端测试通过
- main 分支 Pages 发布通过
