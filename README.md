# px

**px** is a CLI tool used to run commands across different JavaScript package managers.

With **px**, you no longer need to switch between package managers when working on different projects. It detects the project's package manager and forwards the command for you. The command is not changed, just forwarded.

## Features

- Execute the same set of commands without needing to switch package managers
- Automatically installs and uninstalls **TypeScript declaration packages** with their corresponding npm packages
- For npm, **px** automatically adds the `run` prefix for npm scripts (e.g. `px dev` results in `npm run dev`)
- Compatible with **npm, pnpm, and yarn**

## Install

```sh
npm install -g [PKG]
```

## Usage

To use **px**, simply replace your package manager command with `px` followed by the usual arguments you would pass. For example:

```sh
px install       # Installs dependencies
px dev           # Runs the 'dev' script, automatically adding 'run' for npm
px test          # Executes the 'test' script
px build         # Builds the project
```

**px** will detect the package manager your project is using and execute the command as if you had used the package manager's native CLI.

## Automatic TypeScript Declarations

**px** improves the experience of in TypeScript projects by making it easier to manage TypeScript declaration packages. When you install or uninstall npm packages in a TypeScript project, **px** will:

- **On install**: Automatically search for and install the corresponding TypeScript declaration packages (`@types/*`) if they exist.
- **On uninstall**: Check for any installed declaration packages associated with the npm packages being removed and uninstall them as well.

This feature saves time and ensures your TypeScript types stay in sync with your installed packages, all without the need for manual intervention.

## License

This tool is open-source and available under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

Built with 🧡 by [AE Studio](https://ae.studio/join-us/)
