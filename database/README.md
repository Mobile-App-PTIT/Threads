# Guide to Using `config.ps1`

The `config.ps1` file is a PowerShell script used to configure your working environment. Below are detailed steps to use this file.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Commands in `config.ps1`](#commands-in-configps1)

## System Requirements

Before you begin, ensure you have the following installed:

- Windows PowerShell 5.1 or PowerShell Core 7.x
- Administrator privileges to run PowerShell commands

## Installation

1. Download the `config.ps1` file from your repository or obtain it from your project manager.
2. Save the file in the directory where you want to perform the configuration.

## Usage

### Step 1: Open PowerShell

Open PowerShell with administrator privileges. You can do this by:

1. Pressing `Windows + X` and selecting `Windows PowerShell (Admin)` or `Windows Terminal (Admin)`.
2. Or searching for `PowerShell` in the Start menu, right-clicking, and selecting `Run as administrator`.

### Step 2: Run the Script

Navigate to the directory containing the `config.ps1` file and run the script with the following command:

```powershell
cd path\to\your\script
.\config.ps1
```

## Commands in `config.ps1`

The `config.ps1` script provides the following commands:

- **`1`**: Backup the data for the mongo container.
- **`2`**: Restore the data for the mongo container.
- **`3`**: Create a new database for the mongo container. You can choose from the following options:
  - **`1`**: Create a new database.
  - **`2`**: Run the mongo container with web interface for root user (Mongo Express).
  - **`3`**: Run the mongo container with web interface for dev user (Mongo Express).
- **`4`**: Delete all images, containers, and volumes that exist on your machine.
- **`5`**: Delete all containers that relate to the mongo container.
- **`6`**: Delete the volume. You can choose from the following options:
  - **`1`**: Delete the volume for the mongo container.
  - **`2`**: Delete all volumes.
- **`7`**: Exit the script.

When you run the script, you will be prompted to enter a command number. Choose the appropriate command based on your requirements.

---

> **Note**: This script is intended for educational purposes and may need to be modified for production environments. Use it at your own risk.
