import Configstore from 'configstore'

import packageJson from '../package.json' with { type: 'json' }

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
