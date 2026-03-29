# 后端 API 设计

## 鉴权

本次使用本地 demo JWT。

- 请求头：`Authorization: Bearer <token>`
- 获取方式：`POST /api/v1/auth/demo-login`

## Auth

### `POST /api/v1/auth/demo-login`

请求：

```json
{
  "phone": "13800000000"
}
```

响应：

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "profile": {
    "id": "11111111-1111-1111-1111-111111111111",
    "full_name": "张小雨",
    "phone_number": "13800000000"
  }
}
```

### `GET /api/v1/me`

返回当前 demo 用户、可访问老人和默认 elder id。

## Institutions

### `GET /api/v1/institutions`

返回机构列表，字段覆盖首页机构卡片。

### `GET /api/v1/institutions/{id}`

返回机构详情、服务项、基础评价摘要。

## Health

### `GET /api/v1/elders/{id}/health/summary`

返回健康摘要：

- 平均心率
- 当前血压
- 风险提示
- 最近同步时间

### `GET /api/v1/elders/{id}/health/metrics?range=7d|30d`

返回趋势图需要的血压和心率点位。

## Dynamics

### `GET /api/v1/elders/{id}/dynamics`

返回长辈动态列表及评论。

### `POST /api/v1/dynamics/{id}/like`

切换点赞状态。

### `POST /api/v1/dynamics/{id}/comments`

新增评论。

## Service Logs

### `GET /api/v1/elders/{id}/service-logs?day_index=0..6`

返回指定日的服务日志集合。

## Orders

### `GET /api/v1/orders`

返回当前用户名下订单。

### `POST /api/v1/orders/sign`

创建签约订单。

### `POST /api/v1/orders/{id}/reviews`

提交订单评价。

## Assistant

### `POST /api/v1/assistant/sessions`

创建会话。

请求：

```json
{
  "elder_id": "e1234567-e89b-12d3-a456-426614174000"
}
```

### `GET /api/v1/assistant/sessions/{id}`

返回会话元信息。

### `GET /api/v1/assistant/sessions/{id}/messages`

返回消息列表。

### `POST /api/v1/assistant/sessions/{id}/messages`

请求：

```json
{
  "content": "怎么查看健康数据？"
}
```

响应：

```json
{
  "session_id": "uuid",
  "user_message": {
    "id": "uuid",
    "role": "user",
    "content": "怎么查看健康数据？"
  },
  "assistant_message": {
    "id": "uuid",
    "role": "assistant",
    "content": "你可以点击底部导航里的数据页面查看健康看板。"
  }
}
```

## 错误码

- `400`: 参数错误
- `401`: 未认证或 token 无效
- `404`: 资源不存在
- `409`: 重复操作
- `502`: 上游模型调用失败
- `503`: 模型配置缺失或服务不可用
