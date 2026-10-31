param(
    [string]$OutputPath = ''
)
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location -LiteralPath $taskRoot
try {
    node tools/check-secrets.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Secret check failed; no export was created.' }
    if (!$OutputPath) {
        $OutputPath = Join-Path $taskRoot ('local-only\exports\ninetime-github-ready-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip')
    }
    $target = [IO.Path]::GetFullPath($OutputPath)
    if (Test-Path -LiteralPath $target) { throw 'Refusing to overwrite an existing archive.' }
    $files = @(& git -c core.quotePath=false ls-files --cached --others --exclude-standard | Sort-Object -Unique)
    if ($LASTEXITCODE -ne 0 -or !$files.Count) { throw 'Unable to list source files.' }
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::Open($target, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $full = [IO.Path]::GetFullPath((Join-Path $taskRoot $file))
            if (!$full.StartsWith($taskRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
                throw 'Source path is outside the project.'
            }
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive, $full, $file.Replace('\', '/'), [IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    } finally { $archive.Dispose() }
    $archive = [IO.Compression.ZipFile]::OpenRead($target)
    try {
        if ($archive.Entries.Count -ne $files.Count) { throw 'Archive file count mismatch.' }
        foreach ($entry in $archive.Entries) {
            $stream = $entry.Open()
            try { $zipHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)) }
            finally { $stream.Dispose() }
            $sourceHash = (Get-FileHash -LiteralPath (Join-Path $taskRoot $entry.FullName) -Algorithm SHA256).Hash
            if ($zipHash -ne $sourceHash) { throw ('Archive verification failed: ' + $entry.FullName) }
        }
    } finally { $archive.Dispose() }
    Write-Output ("Verified source export: {0} ({1} files)" -f $target, $files.Count)
} finally { Pop-Location }
