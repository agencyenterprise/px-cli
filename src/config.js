import fs from 'node:fs'

import Configstore from 'configstore'

export const packageJson = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url)),
)

export const config = new Configstore(packageJson.name, {
  /**
   * List of packages we verified that have a `@types/*` package on npm.
   * @type {string[]}
   */
  packagesWithTypes: [],

  /**
   * List of packages we verified that DO NOT have a `@types/*` package on npm.
   * @type {string[]}
   */
  packagesWithoutTypes: [],
})
