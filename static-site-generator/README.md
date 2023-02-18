# Static-site generator

This is a simple static site generator that creates static websites from markdown files
The generator is bulit for Linux operating system using `bash scripts`, `javascript`, `html` and `css`.

### Installation 
To install static gen run 
```bash
sudo ./install
```

`staticgen` requires `nodejs`, and modules `showdown`, `sass`, and `serve` to generate builds, the installer will check if these are available during installation, if not, the installer automatically installs them.

#### nodejs
Nodejs is required to run javascript codes locally and can be found from the official nodejs website [nodeorg](https://nodejs-site)

#### showdown
This is required to converd markdown syntaxing to HTML5 tags and can be installed by running
```bash
npm install -g showdown
```

#### sass
This is required to compile scss to css and can be manually installed by running:
```bash
npm install -g sass
```

#### serve
This is required for local testing of the build pages and will not auto install during installation, but if you execute build with option serve or run `staticgen --serve build`, then staticgen will automatically install it if not available already.
serve can also be manually installed by running:
```bash
npm install -g serve
```
#### meta-parser
This is a custom module for parsing markdown meta-data

### Usage
Usage syntax:
staticgen [OPTION] [dirname]
examples:
Checking version
```bash
staticgen --version
```

Generating static files from markdown files in `examplemd` to `examplebuild`
```bash
staticgen examplemd examplebuild
```

Starting server to serve static files in dir `examplebuild`
```bash
staticgen --serve examplebuild
```

Where `examplemd` is the path to the directory containing markdown files and `examplebuild` is the path to output your build
If `build` path is not provided, then static gen will create a default build directory in the current working directory.
If the build path provided is a directory with files in it static gen will delete all the files in it during build process.

### Meta-data syntax
staticgen will automatically create `path` and `title` metadata if not provided in the markdown files
- `path` will be the path to the markdown file relative from the parent directory
- `title` will be the filename
If metadata is provided then both `title` and `path` from the meta-data is used
```
---
title: will be the page title
description: will be passed as meta-data in the html file
category: can be `article`, `page` or `aboutus` if article then it will be displayed in homepage as an article, if page then a page is created and a link provided in the homepage, if `aboutus` then it will be used in the aboutus page
path: will be used as the path to access the page
---
```
Any other meta-data passed outside this will be forwarded to the html document `meta` tag

Author: [Jashon Osala](https://github.com/osala-eng)
[Repository](https://github.com/osala-eng/developer-challange)
