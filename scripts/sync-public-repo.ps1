param([string]$SnapshotMessage = "Update public source snapshot")

$ErrorActionPreference = "Stop"
$publicRepository = "https://github.com/JCASASB/MemoryOnlineFE.git"

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git terminó con código ${LASTEXITCODE}: git $($Arguments -join ' ')"
    }
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$snapshotRoot = Join-Path $env:TEMP ("memoryonlinefe-public-" + [guid]::NewGuid())
$archivePath = Join-Path $env:TEMP ("memoryonlinefe-public-" + [guid]::NewGuid() + ".zip")

Push-Location $repositoryRoot
try {
    if ((git branch --show-current).Trim() -ne "main") {
        throw "Ejecuta el script desde la rama main."
    }
    $changes = git status --porcelain
    if ($changes) {
        throw "Hay cambios locales sin commit. Confírmalos antes de sincronizar:`n$changes"
    }

    Write-Host "Actualizando MemoryOnlineFE_azure/main..."
    Invoke-Git fetch origin main
    Invoke-Git pull --ff-only origin main
    Invoke-Git push origin main
    $sourceCommit = (git rev-parse main).Trim()
    $sourceShortCommit = (git rev-parse --short main).Trim()

    New-Item -ItemType Directory -Path $snapshotRoot | Out-Null
    Invoke-Git archive --format=zip --output=$archivePath main
    Expand-Archive -Path $archivePath -DestinationPath $snapshotRoot

    # El repositorio público nunca contiene configuración de producción.
    Get-ChildItem $snapshotRoot -Recurse -Force -File |
        Where-Object { $_.Name -eq ".env" -or $_.Name -like ".env.production*" } |
        Remove-Item -Force

    $workflowDirectory = Join-Path $snapshotRoot ".github\workflows"
    if (Test-Path $workflowDirectory) {
        Remove-Item -Recurse -Force $workflowDirectory
    }

    $publicGitIgnore = Join-Path $snapshotRoot ".gitignore"
    Add-Content -Path $publicGitIgnore -Value @(
        "",
        "# Production environment files are never published",
        ".env",
        ".env.production",
        ".env.production.*",
        ".github/workflows/"
    )

    Push-Location $snapshotRoot
    try {
        Invoke-Git init --initial-branch=main
        Invoke-Git config user.name "JCASASB"
        Invoke-Git config user.email "hispalance@gmail.com"
        Invoke-Git add --all
        Invoke-Git commit -m "$SnapshotMessage ($sourceShortCommit)"

        # main público es deliberadamente una instantánea sin historial anterior.
        Invoke-Git push $publicRepository main:main --force
        $snapshotCommit = (git rev-parse main).Trim()
    }
    finally {
        Pop-Location
    }

    $remoteCommit = (git ls-remote $publicRepository refs/heads/main).Split("`t")[0]
    if ($remoteCommit -ne $snapshotCommit) {
        throw "La verificación final falló: GitHub no contiene la instantánea generada."
    }
    Write-Host "Repositorio público reemplazado por una instantánea de un commit."
    Write-Host "Origen: $sourceCommit"
    Write-Host "Snapshot público: $snapshotCommit"
}
finally {
    Pop-Location
    if (Test-Path $snapshotRoot) { Remove-Item -Recurse -Force $snapshotRoot }
    if (Test-Path $archivePath) { Remove-Item -Force $archivePath }
}
