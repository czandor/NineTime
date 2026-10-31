param(
    [ValidateSet('aplite', 'basalt', 'chalk', 'diorite')]
    [string]$Platform = 'basalt',
    [string]$Distro = 'NineTimeSDK'
)
$ErrorActionPreference = 'Stop'
$windowsTools = $PSScriptRoot.Replace('\', '/')
$linuxTools = & wsl -d $Distro -u root -- wslpath -a $windowsTools
if ($LASTEXITCODE -ne 0 -or !$linuxTools) { throw 'The configured WSL SDK environment is unavailable.' }
$linuxTools = $linuxTools.Trim()
& wsl -d $Distro -u root -- bash "$linuxTools/emulator.sh" $Platform
if ($LASTEXITCODE -ne 0) { throw 'Pebble emulator startup failed. See the output above.' }
Write-Output "NineTime emulator started: $Platform."
