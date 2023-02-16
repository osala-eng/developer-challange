#!/bin/node

/**
 * Extract meta-data from markdown and save in a json file
 * Author Jashon Osala
 * github: https://github.com/osala-eng
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

class DataFile {
  'meta-data' = {};
  'meta-match' = /^(?:\-\-\-)(.*?)(?:\-\-\-|\.\.\.)/s;

  /**
   * Class constructor
   * @param outDir The directory to output json file after extracting meta-data
   * @param markdownDir The directory containing all the markdown files
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

      // append filename as title if no meta
      if (!meta) {
        const { name } = path.parse(file);
        this['meta-data'][file] = {
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
          if (this['meta-data'][file]) {
            this['meta-data'][file] = {
              ['meta']: {
                ...this['meta-data'][file]['meta'],
                [key.trim()]: value.trim()
              }
            }
          } else {
            this['meta-data'][file] = {
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

/**
 * Check if all the params are provided then run the program
 * otherwise exit with code 1
 */
const { argv } = process

if (argv.length < 4) {
  console.log(`Usage: ${path.parse(argv[1]).name}.mjs markdowndir outputdir`);
  process.exit(1);
} else {
  new DataFile();
}
