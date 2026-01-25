
# 青松智陪 - 后端开发指导手册 (FastAPI + Supabase)

## 1. 项目结构建议
采用典型的服务分层架构，确保逻辑解耦。

```text
backend/
├── app/
│   ├── api/                # API 路由 (v1)
│   │   ├── endpoints/      # 具体的端点 (health.py, orders.py, group.py)
│   ├── core/               # 配置 (config.py, supabase_client.py)
│   ├── dependencies/       # 依赖注入 (auth_handler.py)
│   ├── schemas/            # Pydantic 模型 (入参/回参校验)
│   ├── services/           # 核心业务逻辑 (预警算法, 支付处理)
│   └── main.py             # 入口文件
├── tests/                  # 单元测试
└── requirements.txt
```

## 2. 核心技术实现

### A. Supabase 异步集成
使用 `supabase-py` 的异步客户端。在 `core/supabase_client.py` 中初始化：
```python
from supabase.lib.client_options import ClientOptions
from supabase_py_async import create_client

supabase: Client = await create_client(
    SUPABASE_URL, 
    SUPABASE_KEY,
    options=ClientOptions(postgrest_client_timeout=10)
)
```

### B. 身份验证依赖
FastAPI 中间件需要校验前端传来的 `Authorization: Bearer <JWT>`。
```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 直接调用 Supabase Auth API 验证令牌
    user = await supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
```

### C. 健康预警逻辑
虽然数据库有 Trigger，但后端 Service 层应处理“紧急推送”逻辑（如对接极光推送或短信）。
```python
async def ingest_health_data(data: HealthInput):
    # 1. 写入数据库
    result = await supabase.table("health_metrics").insert(data.dict()).execute()
    
    # 2. 如果数据异常，触发即时通讯通知
    if data.is_abnormal:
        await notification_service.send_alert(
            elder_id=data.elder_id, 
            msg=f"紧急：检测到老人{data.name}血压异常！"
        )
```

## 3. API 端点规划

| 模块 | 方法 | 路径 | 描述 |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/verify-code` | 验证手机验证码并返回 JWT |
| **Elder** | GET | `/elders/{id}` | 获取老人详情及当前健康状态 |
| **Health** | GET | `/health/realtime/{elder_id}` | 获取最近 24 小时时序数据 |
| **Order** | POST | `/orders/sign` | 提交签约表单（含 base64 签名处理） |
| **Order** | GET | `/orders/my` | 获取家属名下所有签约订单 |
| **Group** | POST | `/groups/invite` | 生成邀请码（对应前端扫描功能） |
| **Group** | POST | `/groups/join` | 扫码后调用，确认加入家庭组 |

## 4. 权限校验规范
在 `dependencies` 中实现 `check_admin_access`：
1. 查询 `family_groups` 表。
2. 校验 `profile_id == current_user.id` 且 `role == 'admin'`。
3. 若不满足，返回 `403 Forbidden`。

## 5. 实时性增强
前端应直接订阅 Supabase Realtime：
```javascript
// 前端示例逻辑
supabase
  .channel('health_alerts')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'health_metrics', filter: 'is_abnormal=eq.true' }, 
  payload => {
    showRedAlertToast(payload.new);
  })
  .subscribe();
```
