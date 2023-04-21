# Gcovr Action

[![latest version](https://img.shields.io/github/v/release/threeal/gcovr-action)](https://github.com/threeal/gcovr-action/releases/)
[![license](https://img.shields.io/github/license/threeal/gcovr-action)](./LICENSE)
[![test status](https://img.shields.io/github/actions/workflow/status/threeal/gcovr-action/test.yml?label=test&branch=main)](https://github.com/threeal/gcovr-action/actions/workflows/test.yml)

Generate code coverage reports for a C++ project on [GitHub Actions](https://github.com/features/actions) using [gcovr](https://gcovr.com/en/stable/).

## Features

- Generate code coverage reports using [gcovr](https://gcovr.com/en/stable/).
- Generate and send reports in [Coveralls API](https://docs.coveralls.io/api-introduction) format.
- Auto detect and install required dependencies.
- Support coverage report on [GCC](https://gcc.gnu.org/) and [LLVM Clang](https://clang.llvm.org/).
- Support files exclusion and fail if coverage is below a specific thresold.

## Usage

For more information, see [action.yml](./action.yml) and [GitHub Actions guide](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions).

### Inputs

| Name | Value Type | Description |
| --- | --- | --- |
| `root` | Path | Root directory of your source files. Defaults to current directory. File names are reported relative to this directory. |
| `gcov-executable` | Executable name with optional arguments | Use a particular [gcov](https://gcc.gnu.org/onlinedocs/gcc/Gcov.html) executable. Must match the compiler you are using, e.g. `llvm-cov gcov` for [LLVM Clang](https://clang.llvm.org/). See [this](https://gcovr.com/en/stable/guide/compiling.html#choosing-the-right-gcov-executable). |
| `excludes` | One or more regular expression | Exclude source files that match these filters. |
| `fail-under-line` | 0 - 100 | Fail if the total line coverage is less than this value. |
| `coveralls-out` | Path | Output file of the generated [Coveralls API](https://docs.coveralls.io/api-introduction) coverage report. |
| `coveralls-send` | `true` or `false` | Send the generated Coveralls API coverage report to it's endpoint. Defaults to `false`. |
| `github-token` | Token | [GitHub token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) of your project. Should be set to `secrets.GITHUB_TOKEN`. Required for sending Coveralls API coverage report successfully. |

> Note: All inputs are optional.

### Examples

```yaml
name: test
on:
  push:
jobs:
  test-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Check out this repository
        uses: actions/checkout@v3.2.0

      - name: Build and test this project
        run: |
          cmake . -B build
          cmake --build build
          ctest --test-dir build

      - name: Generate a code coverage report
        uses: threeal/gcovr-action@latest
```

> Note: You can replace `@latest` with any version you like. See [this](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsuses).

#### Using LLVM Clang

```yaml
- name: Build and test this project
  run: |
    cmake . -B build -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++
    cmake --build build
    ctest --test-dir build

- name: Generate a code coverage report
  uses: threeal/gcovr-action@latest
  with:
    gcov-executable: llvm-cov gcov
```

#### Send to Coveralls

```yaml
- name: Generate and send a code coverage report to Coveralls
  uses: threeal/gcovr-action@latest
  with:
    coveralls-send: true
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## License

This project is licensed under the terms of the [MIT License](./LICENSE).

Copyright © 2022-2023 [Alfi Maulana](https://github.com/threeal/)
