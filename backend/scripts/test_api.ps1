. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$repoRoot = Get-RepoRoot
$python = Ensure-PythonEnv
$env:PYTHONPATH = (Join-Path $repoRoot 'backend')
& $python -m pytest backend/tests -q
