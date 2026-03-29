# Backend

本目录包含松小暖助手对应的 `FastAPI + PostgreSQL` 后端实现。

## 快速开始

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env.local

powershell -ExecutionPolicy Bypass -File backend\scripts\init_local_pg.ps1
powershell -ExecutionPolicy Bypass -File backend\scripts\create_db.ps1
powershell -ExecutionPolicy Bypass -File backend\scripts\migrate.ps1
powershell -ExecutionPolicy Bypass -File backend\scripts\seed.ps1
powershell -ExecutionPolicy Bypass -File backend\scripts\run_api.ps1
```

## 目录说明

- `app/`: FastAPI 应用代码
- `alembic/`: 数据库迁移
- `scripts/`: 本地 PostgreSQL、迁移、seed 和测试脚本
- `tests/`: 后端接口测试

## 本地测试

```powershell
powershell -ExecutionPolicy Bypass -File backend\scripts\test_api.ps1
```
