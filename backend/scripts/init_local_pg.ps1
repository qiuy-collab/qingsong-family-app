. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$initdb = Ensure-PgTool 'initdb.exe'
$pgCtl = Ensure-PgTool 'pg_ctl.exe'
$dataDir = Get-PgDataDir
$port = Get-PgPort
$backendRoot = Get-BackendRoot
$logDir = Join-Path $backendRoot '.local'
$logFile = Join-Path $logDir 'postgres.log'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

if (-not (Test-Path $dataDir)) {
  & $initdb -D $dataDir -U postgres -A trust -E UTF8 | Out-Host
}

$postgresqlAutoConf = Join-Path $dataDir 'postgresql.auto.conf'
if (-not (Test-Path $postgresqlAutoConf)) {
  New-Item -ItemType File -Path $postgresqlAutoConf | Out-Null
}

$configContent = Get-Content -Raw $postgresqlAutoConf
if ($configContent -notmatch "listen_addresses = '127.0.0.1'") {
  Add-Content -Path $postgresqlAutoConf -Value "listen_addresses = '127.0.0.1'"
}

$statusOutput = & $pgCtl status -D $dataDir 2>&1
if ($LASTEXITCODE -ne 0) {
  & $pgCtl start -D $dataDir -l $logFile -o "`"-p $port`"" -w | Out-Host
}

Wait-ForTcpPort -Port $port
Write-Host "PostgreSQL is ready on 127.0.0.1:$port"
