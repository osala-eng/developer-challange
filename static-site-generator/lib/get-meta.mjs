#! shebang

/**
 * Get meta-data from markdown files
 * Author: Jashon Osala
 * github: https://github.com/osala-eng
 */

import { DataFile } from './js/meta-parser.mjs';
import path from 'path';

if (process.argv.length < 4) {
  console.log(`Usage ${path.parse(process.argv[1].name).mjs} markdowndir outdir`)
  process.exit(1)
} else {
  const args = process.argv.slice(2);
  new DataFile(args)
}
