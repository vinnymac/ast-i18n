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

const jsFiles = shell.find(argv.src).filter(path => /\.(js|ts|tsx)$/.test(path));
setKeyPrefix(argv.keyPrefix);
generateResources(jsFiles, argv.keyMaxLength);
