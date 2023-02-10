/*
get list of files from command line
parse each file to find JSXText (where the translable string should be extracted from)
generate a stable key for each string
generate i18n files based on this
 */
import shell from 'shelljs';

import { getArgs } from './args';
import { generateResources } from './generateResources';
import { setKeyPrefix } from './prefix';

const argv = getArgs();

const files = shell.find(argv.src);

if (files.stderr) {
  throw new Error(`Could not find files at ${argv.src}`);
}

const jsFiles = files.filter(path => /\.(js|ts|tsx)$/.test(path));
setKeyPrefix(argv.keyPrefix);
generateResources(jsFiles, argv.keyMaxLength);
