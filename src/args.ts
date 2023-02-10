import yargs from 'yargs';

import { DEFAULT_TEST_FILE_REGEX } from './filterFiles';

export type Argv = {
  src: string;
  keyMaxLength: number;
  ignoreFilesRegex: string;
  keyPrefix: string;
};

export function getArgs(argv?: Argv) {
  // @ts-expect-error
  return yargs(argv || process.argv.slice(2))
    .usage('Extract all string inside JSXElement')
    .default('src', process.cwd())
    .describe('src', 'The source to collect strings')
    .default('keyMaxLength', 40)
    .describe(
      'keyMaxLength',
      'The max allowed length of the extracted string keys'
    )
    .default('ignoreFilesRegex', DEFAULT_TEST_FILE_REGEX)
    .describe(
      'ignoreFilesRegex',
      `The regex to ignore files in the source.\nThe files with this match is ignored by default:\n${DEFAULT_TEST_FILE_REGEX}`
    )
    .default('keyPrefix', '')
    .describe(
      'keyPrefix',
      'A prefix to be append to the start of a key, useful for categorizing translations.'
    ).argv;
}
