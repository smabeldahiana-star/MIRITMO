[CmdletBinding()]
param(
    [string] $Name,
    [string] $Config = (Join-Path $PSScriptRoot "servers.json"),
    [switch] $All
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Config)) {
    throw "No existe $Config. Copia servers.example.json como servers.json y configura tus servidores locales."
}

$stateDirectory = Join-Path $PSScriptRoot "state"
New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
$configData = Get-Content -Raw -Path $Config | ConvertFrom-Json
$servers = @($configData.servers)

if (-not $servers -or $servers.Count -eq 0) {
    throw "La configuracion no contiene servidores."
}
if (-not $All -and [string]::IsNullOrWhiteSpace($Name)) {
    throw "Indica -Name <nombre> o usa -All."
}

$selected = if ($All) {
    $servers
} else {
    @($servers | Where-Object { $_.name -eq $Name })
}
if ($selected.Count -eq 0) {
    throw "No se encontro el servidor '$Name'."
}

foreach ($server in $selected) {
    $serverName = [string]$server.name
    $pidFile = Join-Path $stateDirectory "$serverName.pid"

    if (Test-Path $pidFile) {
        $existingPid = [int](Get-Content -Raw -Path $pidFile)
        $existing = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($existing) {
            Write-Host "[$serverName] ya esta ejecutandose (PID $existingPid)."
            continue
        }
        Remove-Item -Force -Path $pidFile
    }

    $workingDirectory = [string]$server.workingDirectory
    if ([string]::IsNullOrWhiteSpace($workingDirectory)) {
        $workingDirectory = (Split-Path -Parent $PSScriptRoot)
    } elseif (-not [System.IO.Path]::IsPathRooted($workingDirectory)) {
        $workingDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) $workingDirectory
    }

    $logDirectory = Join-Path $PSScriptRoot "logs"
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    $logFile = Join-Path $logDirectory "$serverName.log"

    foreach ($key in $server.env.PSObject.Properties.Name) {
        [Environment]::SetEnvironmentVariable($key, [string]$server.env.$key, "Process")
    }

    $arguments = @($server.args)
    $process = Start-Process `
        -FilePath ([string]$server.command) `
        -ArgumentList $arguments `
        -WorkingDirectory $workingDirectory `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError $logFile `
        -PassThru

    Set-Content -Path $pidFile -Value $process.Id -NoNewline
    Write-Host "[$serverName] iniciado (PID $($process.Id))."
}
