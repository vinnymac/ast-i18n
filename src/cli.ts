import shell from 'shelljs';

import { generateResources } from './generateResources';
import { filterFiles } from './filterFiles';
import { setKeyPrefix } from './prefix';
import { getArgs, Argv } from './args';

export const run = (argvOverrides: Argv) => {
  const argv = getArgs(argvOverrides);

  const jsFiles = filterFiles(shell.find)(argv.src, argv.ignoreFilesRegex);

  setKeyPrefix(argv.keyPrefix);

  generateResources(jsFiles, argv.keyMaxLength);
};
