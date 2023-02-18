# Static-site generator

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
To use staticgen run the following command
```bash
staticgen markdow build
```

Where `markdown` is the path to the directory containing markdown files and `build` is the path to output your build
If `build` path is not provided, then static gen will create a default build directory in the current working directory.
If the build path provided is a directory with files in it static gen will delete all the files in it during build process.


