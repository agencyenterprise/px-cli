/**
 * Compose the TypeScript declaration package name, according to the DefinitelyTyped
 * [naming convention](https://github.com/DefinitelyTyped/DefinitelyTyped#npm).
 *
 * For example:
 * - `react` -> `@types/react`
 * - `@babel/preset-env` -> `@types/babel__preset-env`
 *
 * @param {string} pkg
 * @returns string
 */
export function composeDeclarationPackageName(pkg) {
  if (pkg.startsWith('@')) {
    const [scope, name] = pkg.slice(1).split('/')
    return `@types/${scope}__${name}`
  }

  return `@types/${pkg}`
}
