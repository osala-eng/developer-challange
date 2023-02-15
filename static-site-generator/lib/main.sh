#!/bin/bash


# Import functions
source ./bash_tools
source ./support_files

# Variables 
OUTDIR="build/pages";
INDIR="$1";

mkdir -p "$OUTDIR";

# Check if markdown exists
check_program markdown &
bash_wait $! "Checking if markdown exists" 

# Convert Markdown to HTML 
convert_to_html "$INDIR" "$OUTDIR" &
bash_wait $! "Converting markdown files to html, please wait"
