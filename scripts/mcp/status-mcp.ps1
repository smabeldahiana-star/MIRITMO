[CmdletBinding()]
param(
    [string] $Name
)

$stateDirectory = Join-Path $PSScriptRoot "state"
if (-not (Test-Path $stateDirectory)) {
    Write-Host "No hay servidores MCP locales iniciados."
    return
}

$pidFiles = Get-ChildItem -Path $stateDirectory -Filter "*.pid"
if (-not $pidFiles) {
    Write-Host "No hay servidores MCP locales iniciados."
    return
}

foreach ($pidFile in $pidFiles) {
    $serverName = [System.IO.Path]::GetFileNameWithoutExtension($pidFile.Name)
    if ($Name -and $serverName -ne $Name) {
        continue
    }

    $pidValue = [int](Get-Content -Raw -Path $pidFile.FullName)
    $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "[$serverName] en ejecucion (PID $pidValue)."
    } else {
        Write-Host "[$serverName] detenido; limpiando estado."
        Remove-Item -Force -Path $pidFile.FullName
    }
}
