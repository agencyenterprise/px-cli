# pxcli

`px` is a command line tool designed for developers who work on multiple JavaScript projects with different package managers. It simplifies the process of running package manager-specific commands by automatically detecting and using the appropriate one for your project.

## Installation

Install `px` globally using `npm` with the following command:

```sh
npm install -g pxcli
```

## Usage

To run a command with `px`, type `px` followed by the command you'd normally use with your package manager. For example:

```sh
# px is an alias for pxcli
px install
```

`px` will detect the package manager based on the lock file in the project directory and execute the corresponding install command. If no lock file is detected, `px` will let you know with a warning message.

## Command Forwarding

`px` currently forwards any commands it doesn't recognize directly to the detected package manager. This allows you to use `px` as a drop-in replacement for `npm`, `pnpm`, or `yarn`.

## License

This tool is open-source and available under the MIT License. See the [LICENSE](./LICENSE) file for details.
