. (Join-Path $PSScriptRoot '_common.ps1')
Import-EnvFile

$psql = Ensure-PgTool 'psql.exe'
$createdb = Ensure-PgTool 'createdb.exe'
$port = Get-PgPort
$dbName = 'qingsong_assistant'

$existsRaw = & $psql -h 127.0.0.1 -p $port -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName';"
$exists = (($existsRaw | Out-String).Trim())
if ($exists -ne '1') {
  & $createdb -h 127.0.0.1 -p $port -U postgres $dbName | Out-Host
}

Write-Host "Database $dbName is ready."
