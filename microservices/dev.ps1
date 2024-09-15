$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Define an array of folders and titles
$projects = @(
    @{ Path = "$scriptDir\auth-service"; Title = "Auth Service"}
)

$runProject = "npm run dev"

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

# Run commands for each project
for ($i = 0; $i -lt $projects.Length; $i++) {
    $project = $projects[$i]
    $wait = $true
    if ($i -eq $projects.Length - 1)
    {
        $wait = $false
    }
    Write-Host "Running $( $project.Title )..."
    RunCommandInNewTab -Path $project.Path -Title $project.Title -Command $runProject -WaitForCompletion $wait
}