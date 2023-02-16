#!/bin/bash
# Generate a static website
# Author Jashon Osala
# Created on ubuntu 22.04

# Check if a dir has been passed
if [ "$#" -eq 0 ]; then
    echo -e "You must provide a dir name containing markdown :)"
    exit 1
fi

# Check if dir is valid directory
if [ ! -d $1 ]; then
    echo -e "$1 is not a directory"
    echo -e "Stopping program..."
    exit 1
fi

# Import functions
source ./bash_tools
source ./support_files

# Declare Variables
REQUIRED_PROGRAMS=("markdown" "node")
REQUIRED_MODULES=("sass")
BUILDDIR="build"
OUTDIR="build/pages"
INDIR="$1"
TMPDIR=".tmp"
WORK_MD="${TMPDIR}/md"
RUNDIR="${TMPDIR}/run"
JSMETATOOL="${RUNDIR}/get-meta.mjs"
JSHTMLTOOL="${RUNDIR}/update-html.mjs"
JSLIB="$RUNDIR/js"
METAJSON="$TMPDIR/meta.json"
HTMLMASTER="htmltemplates/master.html"
SASSY_IN="htmltemplates/styles/main.scss"
SASSY_OUT="$OUTDIR/main.css"

# Check if markdown dir is empty
dir_is_empty "$INDIR"
[[ "$?" -eq 1 ]] && echo -e "$1 is an empty dir" && exit 1

dir_is_empty "$BUILDDIR"
[[ "$?" -eq 0 ]] && Cleanup "$BUILDDIR"

# Create build and working directories
mkdir -p "$OUTDIR" "$WORK_MD" "$RUNDIR"

# Check if markdown exists
print_line "Checking required programs"
check_program "$REQUIRED_PROGRAMS" >"$NULL" 2>&1 &
bash_wait $! "Please wait"

# Copy file templates to working dir
cp "$INDIR"/* "${TMPDIR}/md/"

# Copy js modules and files to run
cp -r js "$RUNDIR/"
cp *.mjs "$RUNDIR/"

# Setup nodejs
print_line "Running nodejs setup"
node_js_setup "$REQUIRED_MODULES" >"$NULL" 2>&1 &
bash_wait $! "Installing please wait"

# Extract meta-data from from markdown files
echo -e "Extracting metadata from files"
shebang_js "$JSMETATOOL" "$JSHTMLTOOL" "$JSLIB"/*.mjs
"$JSMETATOOL" "$INDIR" "$TMPDIR"

# Remove meta-data in workdir files
remove_meta "$WORK_MD"/*

# Convert Markdown to HTML
print_line "Converting markdown to html"
convert_to_html "$WORK_MD" "$OUTDIR" &
bash_wait $! "Please wait"

# Update html files using template
print_line "Updating html files"
"$JSHTMLTOOL" "$METAJSON" "$OUTDIR" "$HTMLMASTER"

# Generate css
print_line "Generating css from templates"
run_sassy_css "$SASSY_IN" "$SASSY_OUT" > "$NULL" 2>&1 &
bash_wait $! "Generating" "Succefully generated"

# Run cleanup function
print_line "Cleaning temporary files"
Cleanup "$TMPDIR" &
bash_wait $! "Running cleanup" "Success"
