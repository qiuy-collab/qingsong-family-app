. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$repoRoot = Get-RepoRoot
$python = Ensure-PythonEnv
$env:PYTHONPATH = (Join-Path $repoRoot 'backend')

$script = @'
from app.db.session import SessionLocal
from app.services.seed import seed_demo_data

db = SessionLocal()
try:
    seed_demo_data(db)
finally:
    db.close()
'@

& $python -c $script
