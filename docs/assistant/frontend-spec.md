# 前端规格

## 页面接入点

- `pages/Home.tsx`
  - 悬浮助手容器
  - 拖动、吸边、位置持久化
  - 聊天面板开关
- `components/AssistantAvatar3D.tsx`
  - 3D 小人展示
  - 待机、点击、说话状态伪动画
- `components/AssistantChatSheet.tsx`
  - 聊天消息列表
  - 输入框
  - 首屏快捷问题
  - 发送和错误提示

## 悬浮助手状态机

- `idle`
  - 默认状态，小人待机漂浮
- `dragging`
  - 按住拖动中，不允许打开聊天
- `snapping`
  - 松手后计算左右吸附位置并过渡
- `chat-open`
  - 聊天面板打开，小人进入说话态伪动画

## 拖动和吸边规则

- 只有位移小于点击阈值时才判定为点击
- 点击阈值：`8px`
- 悬浮层尺寸：`108 x 132`
- 吸边规则：
  - 以小人中心点和屏幕中心线比较
  - 落在左半边时吸附左边
  - 落在右半边时吸附右边
- 顶部安全边距：`80px`
- 底部安全边距：`106px`
- 左右边距：`8px`

## 位置持久化

- `localStorage` key: `songxiaonuan:floating-position`
- 存储结构：
  - `x`
  - `y`
  - `snapped`
- 读取失败时回退到默认右下角位置

## 聊天 UI 状态

- 空态
  - 显示欢迎语和快捷问题
- 发送中
  - 显示用户消息
  - 助手消息区域显示“思考中”
- 成功
  - 追加助手回复
- 失败
  - 显示错误消息
  - 提供“重试发送”

## 前端 API 集成

- `POST /api/v1/auth/demo-login`
- `GET /api/v1/me`
- `POST /api/v1/assistant/sessions`
- `GET /api/v1/assistant/sessions/{id}/messages`
- `POST /api/v1/assistant/sessions/{id}/messages`
- 页面数据接口：
  - 机构、健康、动态、服务日志、订单

## 环境变量

- `VITE_API_BASE_URL`

## 错误处理

- 后端不可达：顶部 toast 提示“服务暂时不可用”
- 消息发送失败：当前消息标记为失败，可重试
- 会话失效：自动重新创建会话
