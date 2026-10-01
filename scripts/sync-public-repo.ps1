param([switch]$ForceMirror)

$ErrorActionPreference = "Stop"
$publicRepository = "https://github.com/JCASASB/MemoryOnlineFE.git"

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git terminó con código ${LASTEXITCODE}: git $($Arguments -join ' ')"
    }
}

Push-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))
try {
    $branch = (git branch --show-current).Trim()
    if ($branch -ne "main") {
        throw "Ejecuta el script desde main. Rama actual: $branch"
    }

    $changes = git status --porcelain
    if ($changes) {
        throw "Hay cambios locales sin commit. Confírmalos antes de sincronizar:`n$changes"
    }

    Write-Host "Actualizando MemoryOnlineFE_azure/main..."
    Invoke-Git fetch origin main
    Invoke-Git pull --ff-only origin main
    Invoke-Git push origin main

    Write-Host "Comparando MemoryOnlineFE/main..."
    Invoke-Git fetch $publicRepository "+refs/heads/main:refs/remotes/public/main"
    $sourceCommit = (git rev-parse main).Trim()
    $publicCommit = (git rev-parse refs/remotes/public/main).Trim()

    & git merge-base --is-ancestor refs/remotes/public/main main
    if ($LASTEXITCODE -eq 0) {
        Invoke-Git push $publicRepository "main:main"
    }
    elseif ($ForceMirror) {
        Write-Warning "Se reemplazará MemoryOnlineFE/main por MemoryOnlineFE_azure/main."
        Invoke-Git push $publicRepository "main:main" "--force-with-lease=refs/heads/main:$publicCommit"
    }
    else {
        throw "Las ramas han divergido. Revisa los cambios o usa -ForceMirror para reemplazar el repositorio público."
    }

    $remoteCommit = (git ls-remote $publicRepository refs/heads/main).Split("`t")[0]
    if ($remoteCommit -ne $sourceCommit) {
        throw "La verificación final falló: los repositorios no coinciden."
    }
    Write-Host "Sincronización completada. Commit: $sourceCommit"
}
finally {
    Pop-Location
}
