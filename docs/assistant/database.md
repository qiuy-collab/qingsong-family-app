# 数据库设计

## PostgreSQL

- 本地 PostgreSQL binaries 目录：
  - `C:\Users\ASUS\Downloads\postgresql-16.13-2-windows-x64-binaries\pgsql`
- 本地 data 目录：
  - `backend\.local\pgdata`
- 本地端口：
  - `54329`
- 应用数据库：
  - `qingsong_assistant`

## 核心表

- `profiles`
  - demo 用户资料
- `institutions`
  - 首页机构卡片与详情页主体
- `institution_services`
  - 机构详情页服务内容
- `institution_reviews`
  - 机构评价
- `elders`
  - 长辈档案
- `family_groups`
  - 用户与长辈关联
- `health_metrics`
  - 健康时序数据
- `dynamics`
  - 长辈动态
- `dynamic_comments`
  - 动态评论
- `service_logs`
  - 服务日志
- `orders`
  - 签约订单
- `order_reviews`
  - 订单评价
- `chat_sessions`
  - 助手会话
- `chat_messages`
  - 助手消息

## 迁移顺序

1. 基础枚举和主表
2. 关联表
3. 聊天表
4. 索引

## 页面与表映射

- Home
  - `institutions`
- OrgDetails
  - `institutions`
  - `institution_services`
  - `institution_reviews`
- HealthData
  - `elders`
  - `health_metrics`
- Dynamics
  - `dynamics`
  - `dynamic_comments`
- ServiceTracking
  - `service_logs`
- Orders / SigningProcess
  - `orders`
  - `order_reviews`
- Assistant
  - `chat_sessions`
  - `chat_messages`

## 初始数据

seed 必须包含：

- 1 个 demo 用户
- 1 个默认 elder
- 3 个机构
- 每个机构的服务项
- 机构评价
- 7 天健康数据
- 3 条动态与评论
- 7 天服务日志
- 2 条订单
- 1 条历史助手会话和消息
