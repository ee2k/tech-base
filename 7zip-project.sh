#!/bin/bash

# This script should be located inside the project directory (e.g., no-trace-message/)

# Get the absolute path of the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# The name of the directory to be zipped is the name of the directory the script is in
FOLDER_NAME=$(basename "$SCRIPT_DIR")
# The archive will be created in the parent directory
ARCHIVE_DEST_DIR=$(dirname "$SCRIPT_DIR")

# Define archive name variables
pack_name="${pack_name:-$FOLDER_NAME}"
# pack_name="xxx"
current_date=$(date +"%Y_%m_%d_%H")
file_name="${pack_name}-${current_date}.7z"

# Change to the parent directory to create the archive there
cd "$ARCHIVE_DEST_DIR" || exit

# Compress the folder using 7z.
# We add exclusions for the backend directory to only keep src/, Cargo.toml, and .env
7z a -p -t7z -mhe=on "$file_name" "$FOLDER_NAME/" \
    -x!"$FOLDER_NAME/.vscode/" \
# Check if the archive was created successfully
if [ -f "$file_name" ]; then
    echo "Archive created successfully: $file_name"
else
    echo "Failed to create archive."
    exit 1
fi
