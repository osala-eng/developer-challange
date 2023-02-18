#!/bin/node

/**
 * Update the generated html files using an html file template
 * Author: Jashon Osala
 * github: https://github.com/osala-eng
 */

import { HtmlMetaUpdate } from './js/meta-parser.mjs';
import path from 'path';

if (process.argv.length < 6) {
  console.log(`Usage ${path.parse(process.argv[1].name).mjs} 
    jsonpath buildpath template`)
  process.exit(1)
} else {
  const args = process.argv.slice(2);
  new HtmlMetaUpdate(args)
}
