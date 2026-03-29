# 本地开发指南

## 前提

- Node.js 20+
- Python 3.12+
- 已存在 PostgreSQL binaries：
  - `C:\Users\ASUS\Downloads\postgresql-16.13-2-windows-x64-binaries\pgsql`

## 1. 安装前端依赖

```powershell
npm install
```

## 2. 创建 Python 虚拟环境

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python -m pip install -r backend\requirements.txt
```

## 3. 配置环境变量

- 根目录：
  - 复制 `.env.example` 为 `.env.local`
- backend 目录：
  - 复制 `backend\.env.example` 为 `backend\.env.local`

关键变量：

- `VITE_API_BASE_URL=http://127.0.0.1:8000`
- `DATABASE_URL=postgresql+psycopg://postgres@127.0.0.1:54329/qingsong_assistant`
- `LLM_BASE_URL=https://api.edgefn.net/v1`
- `LLM_MODEL=GLM-5`
- `LLM_API_KEY=<本地真实密钥>`

## 4. 初始化 PostgreSQL

```powershell
backend\scripts\init_local_pg.ps1
backend\scripts\create_db.ps1
backend\scripts\migrate.ps1
backend\scripts\seed.ps1
```

## 5. 启动后端

```powershell
backend\scripts\run_api.ps1
```

## 6. 启动前端

```powershell
npm run dev
```

## 7. 测试

```powershell
backend\scripts\test_api.ps1
npm run build
```

## 常见问题

- `psql 不存在`
  - 检查 PostgreSQL binaries 路径
- `54329 端口被占用`
  - 关闭旧进程或修改脚本端口
- `502/503 模型错误`
  - 检查 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`
- `前端请求失败`
  - 检查 `VITE_API_BASE_URL` 和后端是否启动
