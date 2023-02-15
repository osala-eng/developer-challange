#!/bin/bash

# Import functions from support_files
source ./support_files

# Variables 
OUTDIR="build";
INDIR="$1";

mkdir -p "$OUTDIR";

check_program markdown # Check if mardown exists if not install it

# Convert Markdown to HTML 
convert_to_html "$INDIR" "$OUTDIR";
