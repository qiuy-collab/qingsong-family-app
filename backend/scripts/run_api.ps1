. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$repoRoot = Get-RepoRoot
$python = Ensure-PythonEnv
$env:PYTHONPATH = (Join-Path $repoRoot 'backend')
& $python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
