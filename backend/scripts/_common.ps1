Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-BackendRoot {
  return Split-Path -Parent $PSScriptRoot
}

function Get-RepoRoot {
  return Split-Path -Parent (Get-BackendRoot)
}

function Import-EnvFile {
  $backendRoot = Get-BackendRoot
  $envFile = Join-Path $backendRoot '.env.local'
  if (-not (Test-Path $envFile)) {
    return
  }

  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $parts = $line.Split('=', 2)
    if ($parts.Length -eq 2) {
      [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
    }
  }
}

function Get-PgBinDir {
  if ($env:PG_BIN_DIR) { return $env:PG_BIN_DIR }
  return 'C:\Users\ASUS\Downloads\postgresql-16.13-2-windows-x64-binaries\pgsql\bin'
}

function Get-PgPort {
  if ($env:PG_PORT) { return [int]$env:PG_PORT }
  return 54329
}

function Get-PgDataDir {
  if ($env:PG_DATA_DIR) { return $env:PG_DATA_DIR }
  return (Join-Path (Get-BackendRoot) '.local\pgdata')
}

function Ensure-PythonEnv {
  $repoRoot = Get-RepoRoot
  $pythonPath = Join-Path $repoRoot 'backend\.venv\Scripts\python.exe'
  if (-not (Test-Path $pythonPath)) {
    throw "Python virtual environment not found at $pythonPath"
  }
  return $pythonPath
}

function Ensure-PgTool {
  param([string]$ToolName)

  $path = Join-Path (Get-PgBinDir) $ToolName
  if (-not (Test-Path $path)) {
    throw "PostgreSQL tool not found: $path"
  }
  return $path
}

function Wait-ForTcpPort {
  param(
    [string]$Host = '127.0.0.1',
    [int]$Port,
    [int]$TimeoutSeconds = 20
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $tcp = New-Object System.Net.Sockets.TcpClient
      $async = $tcp.BeginConnect($Host, $Port, $null, $null)
      $connected = $async.AsyncWaitHandle.WaitOne(300)
      if ($connected -and $tcp.Connected) {
        $tcp.EndConnect($async)
        $tcp.Close()
        return
      }
      $tcp.Close()
    } catch {
    }
    Start-Sleep -Milliseconds 300
  }

  throw "Timed out waiting for TCP port $Host`:$Port"
}
