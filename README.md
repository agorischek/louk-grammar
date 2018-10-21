# Louk Grammar
Syntax highlighting for Louk

## About
This is the core development repository for the Louk language grammar, which provides syntax highlighting to text editors. All grammar and metadata changes must be made in this repository, then built into standalone repositories for distribution. For individual editor packages and repositories, see:
1. Atom: [`language-louk` package](http://atom.io/packages/language-louk) | [`louk-editor-atom` repository](https://github.com/louk-lang/louk-editor-atom)
2. Sublime (Coming soon)
3. VS Code (Coming soon)
4. Textmate (Coming soon)

## Tasks
This repository uses gulp tasks for its build pipeline:

* `gulp build` processes the source files and writes the output to the `staging` directory.
* `gulp preview` copies all files from the `staging` subdirectories to their respective preview directories for local testing.
* `gulp distribute` copies all files from the `staging` subdirectories to their respective distribution directories for publishing.
* `gulp test` runs basic sanity checks on the built packages.
* `gulp watch` watches for changes in the source folder, then runs `build` and `preview`.
* `gulp` runs `build`, `preview`, `distribute`, and `test`.

## Publishing

To publish package updates:

1. Ensure all editor package repositories are cloned locally as peers of this repository.
2. Update the `version` in `source/package.json` according to semantic versioning. The version chosen here should then be used for all following steps. (Note: the `version` in this repository's root package is **not** used for versioning the individual editor packages.)
3. Run `gulp`.
4. For each editor-specific repository, create and push a Git tag with the new version: `git tag v_._._` and `git push tag v_._._`.
5. Publish each individual editor package according to their particular steps:
    * For Atom, publish using the specific tag: `apm publish --tag v_._._`.

