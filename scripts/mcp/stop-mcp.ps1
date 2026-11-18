[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $Name
)

$ErrorActionPreference = "Stop"
$stateDirectory = Join-Path $PSScriptRoot "state"
$pidFile = Join-Path $stateDirectory "$Name.pid"

if (-not (Test-Path $pidFile)) {
    Write-Host "[$Name] no esta ejecutandose."
    return
}

$pidValue = [int](Get-Content -Raw -Path $pidFile)
$process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $pidValue -Force
    Write-Host "[$Name] detenido (PID $pidValue)."
} else {
    Write-Host "[$Name] no tenia un proceso activo."
}
Remove-Item -Force -Path $pidFile
