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
REQUIRED_PROGRAMS=("node")
REQUIRED_MODULES=("sass" "showdown")
BUILDDIR="build"
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
SASSY_OUT="$BUILDDIR/main.css"
ASSETS="htmltemplates/assets"
SCRIPTS="htmltemplates/scripts"
LOGFILE="/var/log/staticgen/staticgen.log"
ERRORFILE="/var/log/staticgen/staticgen.error"

# Check if markdown dir is empty
check_markdown_dir() {
    dir_is_empty "$INDIR"
    [[ "$?" -eq 1 ]] && echo -e "$INDIR is an empty dir" && exit 1
}

# Create setup data
create_setup_data() {
    dir_is_empty "$BUILDDIR"
    [[ "$?" -eq 0 ]] && Cleanup "$BUILDDIR"

    # Create build and working directories
    mkdir -p "$BUILDDIR" "$RUNDIR"

    # Copy file templates to working dir
    if [ -d "$WORK_MD" ]; then
        print_line "Foud old files cleaning..."
        rm -rf "$WORK_MD"
    fi
    cp -r "$INDIR" "$WORK_MD"

    # Copy js modules and files to run
    cp -r js "$RUNDIR/"
    cp *.mjs "$RUNDIR/"

    # Create all build paths
    create_all_build_paths "$INDIR" "$BUILDDIR"

    # Copy assets to build dir
    cp -r "$ASSETS" "$BUILDDIR/"
    cp -r "$SCRIPTS" "$BUILDDIR/"
}

# Check if markdown exists
run_check_programs() {
    print_line "Running check for required programs"
    for prog in "${REQUIRED_PROGRAMS[@]}"; do
        print_line "Checking for $prog"
        check_program "$prog" >>"$LOGFILE" 2>>"$ERRORFILE" &
        bash_wait $! "Please wait"
    done
}

# Setup nodejs
run_setup_nodejs() {
    print_line "Running nodejs setup"
    for module in "${REQUIRED_MODULES[@]}"; do
        print_line "Locating module $module"
        node_js_setup "$module" >"$LOGFILE" 2>"$ERRORFILE" &
        bash_wait $! "Please wait"
    done
}

# Extract meta-data from from markdown files
run_extract_metadata() {
    echo -e "Extracting metadata from files"
    shebang_js "$JSMETATOOL" "$JSHTMLTOOL" "$JSLIB"/*.mjs
    "$JSMETATOOL" "$INDIR" "$TMPDIR"

    # Remove meta-data in workdir files
    remove_meta "$WORK_MD"
}

# Convert Markdown to HTML
run_convert_to_html() {
    print_line "Converting markdown to html"
    convert_to_html "$WORK_MD" "$BUILDDIR" >>"$LOGFILE" 2>>"$ERRORFILE" &
    bash_wait $! "Please wait"
}

# Update html files using template
run_updata_html_meta_data() {
    print_line "Updating html files"
    "$JSHTMLTOOL" "$METAJSON" "$BUILDDIR" "$HTMLMASTER" >>"$LOGFILE" 2>>"$ERRORFILE" &
    bash_wait $! "Please wait"
}

# Generate css
run_generate_css() {
    print_line "Generating css from sassy templates"
    run_sassy_css "$SASSY_IN" "$SASSY_OUT" >>"$LOGFILE" 2>>"$ERRORFILE" &
    bash_wait $! "Generating" "Succefully generated"
}

# Run cleanup function
run_cleanup() {
    print_line "Cleaning temporary files"
    Cleanup "$TMPDIR" &
    bash_wait $! "Running cleanup" "Success"
}
