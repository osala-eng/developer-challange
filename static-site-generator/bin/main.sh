#!/bin/bash
# Generate a static website
# Author Jashon Osala
# Created on ubuntu 22.04

# Check if a dir has been passed

if [ "$#" -eq 0 ]; then
    echo -e "You must provide a either of the following to continue"
    echo -e "   - dir name containing markdown"
    echo -e "   - markdown file name"
    echo -e "   - Pass markdown as an inline string"
    echo -e
    echo -e "Syntax: staticgen dirname | filename | string"
    exit 1
fi

INPATH="/opt/staticgen"

# Import functions
source $INPATH/bin/bash_tools
source $INPATH/bin/support_files

VERSION="1.0.0"

# Declare Variables
REQUIRED_PROGRAMS=("node")
REQUIRED_MODULES=("sass" "showdown")
BUILDDIR="build"
TMPDIR="/tmp/staticgen"
WORK_MD="${TMPDIR}/md"
RUNDIR="${TMPDIR}/run"
JSMETATOOL="${RUNDIR}/get-meta.mjs"
JSHTMLTOOL="${RUNDIR}/update-html.mjs"
JSLIB="$RUNDIR/js"
METAJSON="$TMPDIR/meta.json"
LIBPATH="/opt/staticgen/lib"
HTMLMASTER="${LIBPATH}/htmltemplates/master.html"
SASSY_IN="${LIBPATH}/styles/main.scss"
SASSY_OUT="$BUILDDIR/main.css"
ASSETS="${LIBPATH}/assets"
SCRIPTS="${LIBPATH}/scripts"
LOGFILE="/var/log/staticgen/staticgen.log"
ERRORFILE="/var/log/staticgen/staticgen.error"
HTMLINDEX="${LIBPATH}/htmltemplates/homepage.html"
ROOTINDEX="${LIBPATH}/htmltemplates/index.html"
HTML404="${LIBPATH}/htmltemplates/404.html"

# Handle input provided to generate a site
run_get_build_and_md() {
    if [ -d "$1" ]; then
        INDIR="$1"
        if [ -z "$2" ]; then
            BUILDDIR="build"
        else
            BUILDDIR="$2"
        fi
    else
        echo -e "You must provide a directory containing markdown"
        exit 1
    fi
}

# Start logfiles with date
start_logs() {
    local loginit="Starting logs for staticgen by Osala: $(date)"
    local errorinit="Starting error logs for staticgen by Osala: $(date)"
    echo -e "$loginit" >"$LOGFILE"
    echo -e "$errorinit" >"$ERRORFILE"
}

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

    # Create all build paths
    create_all_build_paths "$INDIR" "$BUILDDIR"

    # Copy js modules and files to run
    cp -r $INPATH/bin/js "$RUNDIR/"
    cp $INPATH/bin/*.mjs "$RUNDIR/"
}

run_update_static_files() {
    # Copy static files
    cp "$HTML404" "${BUILDDIR}/404.html"
    cp "$ROOTINDEX" "${BUILDDIR}/index.html"
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
        node_js_setup "$module" >>"$LOGFILE" 2>>"$ERRORFILE" &
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
    "$JSHTMLTOOL" "$METAJSON" "$BUILDDIR" "$HTMLMASTER" "$HTMLINDEX" >>"$LOGFILE" 2>>"$ERRORFILE" &
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

# Single page markdown to site setup

single_page_site() {
    run_get_build_and_md "${1%/}" "${2%/}"
    check_markdown_dir
    create_setup_data
    run_check_programs
    run_setup_nodejs
    run_extract_metadata
    run_convert_to_html
    run_updata_html_meta_data
    run_generate_css
    run_update_static_files
    run_cleanup
}

run_serve() {
    print_line "Preparing to serve $1"
    node_js_setup "serve" >>"$LOGFILE" 2>>"$ERRORFILE" &
    bash_wait $! "Please wait"
    npx serve $1
}

case $1 in
"--version") echo -e "$VERSION" && exit 0 ;;
"--serve") run_serve "$2" && exit 0 ;;
"--install-modules")
    run_check_programs
    run_setup_nodejs
    exit 0
    ;;
*) ;;
esac

start_logs
single_page_site "$1" "$2"
