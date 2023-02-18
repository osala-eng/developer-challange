#!/bin/node

/**
 * Extract meta-data from markdown and save in a json file
 * Author Jashon Osala
 * github: https://github.com/osala-eng
 */

import { readdirSync, readFileSync, statSync, writeFileSync, renameSync } from 'fs';
import path from 'path';


class FsTools {
  /**
  * Gets files in the mark-down dir and saves them in this.files
  * @param {string} dirpath path string
  * @param {string []} filesarray Array containing files
  * @returns files array
  */
  getAllFiles = (dirpath, filesarray) => {
    const files = readdirSync(dirpath);
    filesarray = filesarray || [];

    files.forEach(file => {
      const __path = path.join(dirpath, file);
      if (statSync(__path).isDirectory())
        filesarray = this.getAllFiles(__path, filesarray);
      else
        filesarray.push(__path);
    });
    return filesarray
  }

  /**
   * Get filekey from path without ext name and root dir
   * @param {string} filePath path string
   * @param {string} rootDir root directory name
   */
  getFilekey = (filePath, rootDir) => {
    const { ext } = path.parse(filePath);
    const __filekey = filePath.replace(`${rootDir}/`, '');
    const filekey = __filekey.replace(ext, '');
    return filekey;
  }
}

export class DataFile extends FsTools {
  'meta-data' = {};
  'meta-match' = /^(?:\-\-\-)(.*?)(?:\-\-\-|\.\.\.)/s;

  /**
   * This class extracts meta-data from markdown files and stores them
   * in a json file
   * @param {[markdownDir: string, outDir: string]} paths Paths for
   * markdown files dir and output path
   */
  constructor(
    [markdownDir, outDir] = process.argv.slice(2)
  ) {
    super()
    this.markdownDir = markdownDir;
    this.outDir = outDir;
    this.#generateData();
  }

  /**
   * Reads directory syncronously to find all files
   */
  #setFiles = () => {
    this.files = this.getAllFiles(this.markdownDir);
  }

  /**
   * Gets meta-data from markdown files and stores the result in this
   * instance
   */
  #getFilesMeta = () => {
    this.files.every(file => {
      const fileData = readFileSync(file).toString();
      const meta = fileData.match(this['meta-match']);
      const { name, dir, ext } = path.parse(file);
      const filekey = this.getFilekey(file, this.markdownDir);
      // append filename as title if no meta
      if (!meta) {
        this['meta-data'][filekey] = {
          ['meta']: {
            title: name,
            path: filekey + '.html'
          }
        }
        return true;
      }

      // Add found meta-data to this['meta-data']
      meta[1].split('\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          if (this['meta-data'][filekey]) {
            this['meta-data'][filekey] = {
              ['meta']: {
                ...this['meta-data'][filekey]['meta'],
                [key.trim()]: value.trim()
              }
            }
          } else {
            this['meta-data'][filekey] = {
              ['meta']: {
                [key.trim()]: value.trim()
              }
            }
          }
        }
      });
      return true
    });
  }

  /**
   * Creates a json file of the generated meta-data output
   */
  #saveMetadata = () => {
    const outpath = path.join(this.outDir, 'meta.json');
    writeFileSync(outpath, JSON.stringify(this['meta-data'], null, 2), 'utf-8')
  }

  /**
   * Generate data
   */
  #generateData = () => {
    this.#setFiles();
    this.#getFilesMeta();
    this.#saveMetadata();
  }

}



export class HtmlMetaUpdate extends FsTools {
  'meta-data'; 'html-data' = {};
  'head-match' = /{{*.head-data.*}}/i;
  'body-match' = /{{*.body-data.*}}/i;
  'code-match' = /<pre>/gmi;
  'article-match' = /{{*.articles.*}}/i;
  'navigation-match' = /{{*.navigation.*}}/i;

  /**
   * Class constructor requires passing an array of paths for build
   * files
   * @param {[ jsonpath: string, buildpath: string, 
   * template: string]} paths Paths for json meta-data, build dir and 
   * html template
   */
  constructor(
    [jsonpath, buildpath, template, homepage] = process.argv.slice(2)
  ) {
    super();
    this.jsonpath = jsonpath;
    this.buildpath = buildpath;
    this.template = readFileSync(template).toString();
    this.homepage = readFileSync(homepage).toString();
    this.indexfile = homepage
    this.#updateFiles();
  }

  /**
   * Read the json meta-data file path and parse the result to an object
   */
  #updateMeta = () => {
    try {
      const data = readFileSync(this.jsonpath).toString();
      this['meta-data'] = JSON.parse(data);
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * Read the build dir for all the html files available
   * @returns void
   */
  #getHtmlFiles = () => (this.files = this.getAllFiles(this.buildpath));

  /**
   * Matches the required sections and updates them with the correct 
   * data
   * @param {String} newdoc New html file template string
   * @param {{head: string, body: string}} update new data to use
   * @returns HTML string
   */
  #updateDoc = (newdoc, update) => {
    const { head, body } = update;
    const addhead = newdoc.replace(this['head-match'], head);
    const addbody = addhead.replace(this['body-match'], body);
    return addbody;
  }

  /**
   * Generate HTML meta data and for updating the required files
   */
  #generateHtmlMeta = () => {
    this.files.forEach(file => {
      const filekey = this.getFilekey(file, this.buildpath)
      const { title, ...rest } = this['meta-data'][filekey].meta;
      const meta = this['generate-html-meta'](rest).join('\n');
      const body = readFileSync(file).toString();
      const dataUpdate = {
        head: `${meta}\n<title>${title}</title>`,
        body
      }
      const newdoc = this.template;
      const finaledoc = this.#updateDoc(newdoc, dataUpdate);
      writeFileSync(file, finaledoc, 'utf-8');
    });
  }

  #updateHomepageArticles = () => {
    const article = this.files.map(file => {
      const filekey = this.getFilekey(file, this.buildpath);
      const dataDef = this['meta-data'][filekey]['meta'];

      if (dataDef['category'] && dataDef['category'] === 'article') {
        const filepath = dataDef.path;
        const body = readFileSync(file).toString()
        return this['article-template'](body, filepath)
      } else {
        return ''
      }
    }).join('\n')
    this.homepage = this.homepage.replace(this['article-match'], article)
    this.homepage = this.homepage.replace(this['head-match'], '<title>Homepage</title>')
  }

  #updateHomepageNav = () => {
    const navigation = this.files.map(file => {
      const filekey = this.getFilekey(file, this.buildpath);
      const dataDef = this['meta-data'][filekey]['meta'];
      const nav = this['navigation-template'](dataDef.title, dataDef.path)
      return nav
    }).join('')
    const data = this.homepage.replace(this['navigation-match'], navigation)
    writeFileSync(this.buildpath + '/homepage.html', data, 'utf-8')
  }

  #updateFilePaths() {
    this.files.forEach(file => {
      const filekey = this.getFilekey(file, this.buildpath);
      const dataDef = this['meta-data'][filekey]['meta'];
      if (dataDef.path !== filekey + '.html') {
        const pathUpdate = `${this.buildpath}/${dataDef.path}`
        renameSync(file, pathUpdate)
      }
    })
  }

  /**
   * Update html files to match the template file syntax
   */
  #updateFiles = () => {
    this.#updateMeta();
    this.#getHtmlFiles();
    this.#updateHomepageArticles();
    this.#updateHomepageNav();
    this.#generateHtmlMeta();
    this.#updateFilePaths();
  }

  /**
   * Calls generate-template-line and stores the result in an array
   * @param {{[key: string]: string}} data Meta-data object containing
   * key value pairs
   * @returns HTML template string
   */
  'generate-html-meta' = (data) => Object.keys(data).map(line => {
    return this['meta-line-template'](line, data[line])
  });

  /**
   * Generate a single meta line for html
   * @param {String} name 
   * @param {String} content 
   * @returns HTML template string
   */
  'meta-line-template' = (name, content) => `<meta name=${name} content=${content}/>`

  /**
   * Creates a navigation link to a page
   * @param {string} title HTML string
   * @param {string} pathstring Path to page
   * @returns HTML string
   */
  'navigation-template' = (title, pathstring) => `
    <div class="navigation-option">
      <a href="/${pathstring}">${title}</a>
    </div>
  `

  /**
   * Creates an aticle for homepage
   * @param {string} article HTML string 
   * @param {string} pathstring path to article
   * @returns HTML string
   */
  'article-template' = (article, pathstring) => `
    <div class="article-option" >
      ${article}
    </div>
  `
}
