$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Define an array of folders and titles
$projects = @(
    @{ Path = "$scriptDir\auth-service"; Title = "Auth Service"},
    @{ Path = "$scriptDir\user-service"; Title = "User Service"}
)

$runProject = "npm run dev"
$installPackages = "npm install"

function RunCommandInNewTab
{
    param (
        [string]$Path,
        [string]$Title,
        [string]$Command,        
        [bool]$WaitForCompletion = $true
    )

    wt -w 0 nt -p $Title -d "$Path" --title "$Title" pwsh -NoExit -Command "$Command"
    if ($WaitForCompletion)
    {
        Write-Host "Press Enter to continue after $Title completes "
        Read-Host
    }
    else
    {
        Write-Host "All commands have been executed. The script will now exit."
    }
}

function RunAll {
    param (
        [string]$Command
    )
    for ($i = 0; $i -lt $projects.Length; $i++) {
        $project = $projects[$i]
        $wait = $true
        if ($i -eq $projects.Length - 1)
        {
            $wait = $false
        }
        Write-Host "Running $( $project.Title )..."
        RunCommandInNewTab -Path $project.Path -Title $project.Title -Command $Command -WaitForCompletion $wait
    }
}

# Prompt user for action
$choice = Read-Host "Enter 'install' to install packages or 'run' to start projects"

if ($choice -eq 'install') {
    RunAll -Command $installPackages
} elseif ($choice -eq 'run') {
    RunAll -Command $runProject
} else {
    Write-Host "Invalid choice. Please enter 'install' or 'run'."
}