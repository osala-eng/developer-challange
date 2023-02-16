#!/bin/node

/**
 * Extract meta-data from markdown and save in a json file
 * Author Jashon Osala
 * github: https://github.com/osala-eng
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export class DataFile {
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
    this.markdownDir = markdownDir;
    this.outDir = outDir;
    this.#generateData();
  }

  /**
   * Gets files in the mark-down dir and saves them in this.files
   * @returns void
   */
  #getFiles = () => (this.files = readdirSync(this.markdownDir));

  /**
   * Gets meta-data from markdown files and stores the result in this
   * instance
   */
  #getFilesMeta = () => {
    this.files.every(file => {
      const filepath = path.join(this.markdownDir, file)
      const fileData = readFileSync(filepath).toString();
      const meta = fileData.match(this['meta-match']);
      const { name } = path.parse(file);
      // append filename as title if no meta
      if (!meta) {
        this['meta-data'][name] = {
          ['meta']: {
            title: name,
            path: name + '.html'
          }
        }
        return true;
      }

      // Add found meta-data to this['meta-data']
      meta[1].split('\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          if (this['meta-data'][name]) {
            this['meta-data'][name] = {
              ['meta']: {
                ...this['meta-data'][name]['meta'],
                [key.trim()]: value.trim()
              }
            }
          } else {
            this['meta-data'][name] = {
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
    this.#getFiles();
    this.#getFilesMeta();
    this.#saveMetadata();
  }

}



export class HtmlMetaUpdate {
  'meta-data'; 'html-data' = {};
  'head-match' = /{{*.head-data.*}}/i;
  'body-match' = /{{*.body-data.*}}/i;

  /**
   * Class constructor requires passing an array of paths for build
   * files
   * @param {[ jsonpath: string, buildpath: string, 
   * template: string]} paths Paths for json meta-data, build dir and 
   * html template
   */
  constructor(
    [jsonpath, buildpath, template] = process.argv.slice(2)
  ) {
    this.jsonpath = jsonpath;
    this.buildpath = buildpath;
    this.template = readFileSync(template).toString();
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
  #getHtmlFiles = () => (this.files = readdirSync(this.buildpath));

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
      const { name } = path.parse(file);
      const { title, ...rest } = this['meta-data'][name].meta;
      const filepath = path.join(this.buildpath, file);
      const meta = this['generate-html-meta'](rest).join('\n');
      const body = readFileSync(filepath).toString();
      const dataUpdate = {
        head: `${meta}\n<title>${title}</title>`,
        body
      }
      const newdoc = this.template;
      const finaledoc = this.#updateDoc(newdoc, dataUpdate);
      writeFileSync(filepath, finaledoc, 'utf-8');
    });
  }

  /**
   * Update html files to match the template file syntax
   */
  #updateFiles = () => {
    this.#updateMeta();
    this.#getHtmlFiles();
    this.#generateHtmlMeta();
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
}
