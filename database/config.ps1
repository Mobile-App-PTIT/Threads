# create simple run script with following functions:
# 1. Backup
# 2. Restore
# 3. Create database
# 4. Delete image and container, volume if exists
# 5. Delete container
# 6. Delete volume
# Note: Use can choose to use above functions as per requirement

#Variables
$DOCKER_USER = "fnhg1ab0"
$IMAGE_NAME = "threads_data"
$IMAGE_TAG = "latest"
$SERVICE_DB = "threads_mongodb"
$SERVICE_WEB_ROOT = "web_db_root"
$SERVICE_WEB_DEV = "web_db_dev"
$SERVICE_BACKUP = "backup"
$SERVICE_RESTORE = "restore"
$VOLUME_NAME = "database_threads_mongodb_data"

# Function to pull the backup from the backup server
function PullBackup {
    # Pull the image
    docker pull ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}

    # Create a container from the image
    $containerId = docker create ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}

    # Copy all files ending with .tar.bz2 from the container to the host
    docker cp ${containerId}:/app/backups/. ./backup/

    # Remove the container
    docker rm $containerId

    # Remove the image
    docker rmi ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
}

# Function to push the backup to the backup server
function PushBackup {
    # check if the image exists in the local repository and remove it
    if (docker images ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} -q) {
        docker rmi ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}
    }

    # Build the image
    docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} .

    # Tag the image
    docker tag ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}

    # Push the image
    docker push ${DOCKER_USER}/${IMAGE_NAME}:${IMAGE_TAG}

    # Remove all files ending with .tar.bz2 in the backup folder
    # if push fails, print error message and exit
    Remove-Item -Path ./backup/*.tar.bz2 -Force -ErrorAction Stop
}

# Backup
function Backup {
    docker-compose stop $SERVICE_WEB_ROOT
    docker-compose stop $SERVICE_WEB_DEV
    docker-compose stop $SERVICE_DB
    docker-compose run --rm $SERVICE_BACKUP

    # Use relative path to the backup folder
    try {
        & PushBackup
    } catch {
        Write-Error "Failed to execute push.ps1. Exiting..."
        exit 1
    }
    # if you want to specify an alternate target name
    # docker-compose run --rm -e TARGET=mybackup db-backup
}

# Restore from backup
function Restore {
    docker-compose stop $SERVICE_WEB_ROOT
    docker-compose stop $SERVICE_WEB_DEV
    docker-compose stop $SERVICE_DB
    # if pull.ps1 fails, print error message and exit
    try {
        & PullBackup
    } catch {
        Write-Error "Failed to execute pull.ps1. Exiting..."
        exit 1
    }
    docker-compose run --rm $SERVICE_RESTORE
    # if you want to specify an alternate target name
    # docker-compose run --rm -e TARGET=mybackup db-restore
}

# Create database
function CreateDatabase {
    Write-Host "--------------------------------------------------------------------"
    Write-Host "    Choose one of the following choices:"
    Write-Host "    1. Create a new database"
    Write-Host "    2. Create a web database root"
    Write-Host "    3. Create a web database dev"
    Write-Host "    4. Back to main menu"
    $choice = Read-Host "   Enter your choice"
    switch ($choice) {
        1 {
            docker-compose down $SERVICE_DB
            docker-compose up -d $SERVICE_DB
        }
        2 {
            docker-compose down $SERVICE_WEB_ROOT
            docker-compose down $SERVICE_WEB_DEV
            docker-compose up -d $SERVICE_WEB_ROOT
        }
        3 {
            docker-compose down $SERVICE_WEB_ROOT
            docker-compose down $SERVICE_WEB_DEV
            docker-compose up -d $SERVICE_WEB_DEV
        }
        4 {
            return
        }
        default {
            Write-Host "Invalid choice. Please try again."
        }
    }
}

# Delete image and container, volume if exists
function DeleteImageAndContainer {
    docker-compose down
    docker rmi $(docker images -q)
    docker volume rm $(docker volume ls -q)
}

# Delete container
function DeleteContainer {
    docker-compose down
}

# Delete volume
function DeleteVolume {
    Write-Host "--------------------------------------------------------------------"
    Write-Host "    Choose one of the following choices:"
    Write-Host "    1. Delete a specific volume (database_threads_mongodb_data)"
    Write-Host "    2. Delete all volumes"
    Write-Host "    3. Back to main menu"
    $choice = Read-Host "   Enter your choice"
    switch ($choice) {
        1 {
            docker volume rm $VOLUME_NAME
            # delete all volume related to the container threads_mongodb, web_db_root, web_db_dev
            docker volume rm $(docker volume ls -q | Select-String -Pattern "threads_mongodb|web_db_root|web_db_dev")
        }
        2 {
            # remove all volumes
            docker volume rm $(docker volume ls -q)
        }
        3 {
            return
        }
        default {
            Write-Host "Invalid choice. Please try again."
        }
    }
}

# Exit
function Exit {
    exit 0
}

while ($true) {
    Write-Host "-------------------------**********-------------------------"
    Write-Host "Choose one of the following choices:"
    Write-Host "1. Backup"
    Write-Host "2. Restore"
    Write-Host "3. Create database"
    Write-Host "4. Delete image and container, volume if exists"
    Write-Host "5. Delete container"
    Write-Host "6. Delete volume"
    Write-Host "7. Exit"
    $choice = Read-Host "Enter your choice"
    switch ($choice) {
        1 { Backup }
        2 { Restore }
        3 { CreateDatabase }
        4 { DeleteImageAndContainer }
        5 { DeleteContainer }
        6 { DeleteVolume }
        7 { Exit }
    }
}