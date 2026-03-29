. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$repoRoot = Get-RepoRoot
$backendRoot = Get-BackendRoot
$python = Ensure-PythonEnv
$env:PYTHONPATH = (Join-Path $repoRoot 'backend')
Push-Location $backendRoot
try {
  & $python -m alembic -c alembic.ini upgrade head
} finally {
  Pop-Location
}
