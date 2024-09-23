# Gcovr Action

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
| `fail-under-branch` | 0 - 100 | Fail if the total branch coverage is less than this value. |
| `fail-under-function` | 0 - 100 | Fail if the total function coverage is less than this value. |
| `html-out` | Path | Output file of the generated HTML coverage report. |
| `html-theme` | `green` , `blue` , `github.blue` , `github.green` , `github.dark-green` , `github.dark-blue` | Override the default color theme for the HTML report. |
| `xml-out` | Path | Output file of the generated XML coverage report. |
| `coveralls-out` | Path | Output file of the generated [Coveralls API](https://docs.coveralls.io/api-introduction) coverage report. |
| `coveralls-send` | `true` or `false` | Send the generated Coveralls API coverage report to it's endpoint. Defaults to `false`. |
| `github-token` | Token | [GitHub token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) of your project. Defaults to [`github.token`](https://docs.github.com/en/actions/security-guides/automatic-token-authentication). Required for sending Coveralls API coverage report successfully. |
| `working-directory` | Path | Working directory where gcovr should be executed from. |

> Note: All inputs are optional.

### Examples

```yaml
name: test
on:
  push:
jobs:
  test-coverage:
    runs-on: ubuntu-22.04
    steps:
      - name: Check out this repository
        uses: actions/checkout@v4.1.7

      - name: Build and test this project
        run: |
          cmake . -B build
          cmake --build build
          ctest --test-dir build

      - name: Generate a code coverage report
        uses: threeal/gcovr-action@v1.0.0
```

#### Exclude Source Files

```yaml
- name: Generate a code coverage report
  uses: threeal/gcovr-action@v1.0.0
  with:
    excludes: |
      include/internal/*
      src/internal/*
```

#### Output HTML Report

```yaml
- name: Generate a html code coverage report
  uses: threeal/gcovr-action@xml-out
  with:
    html-out: coverage.html
```

#### Output HTML Report generated with a specific theme

```yaml
- name: Generate a html code coverage report
  uses: threeal/gcovr-action@xml-out
  with:
    html-out: coverage.html
    html-theme: github.green
```

#### Output XML Report

```yaml
- name: Generate a code coverage report
  uses: threeal/gcovr-action@xml-out
  with:
    xml-out: coverage.xml
```

#### Using LLVM Clang

```yaml
- name: Build and test this project
  run: |
    cmake . -B build -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++
    cmake --build build
    ctest --test-dir build

- name: Generate a code coverage report
  uses: threeal/gcovr-action@v1.0.0
  with:
    gcov-executable: llvm-cov gcov
```

#### Send to Coveralls

```yaml
- name: Generate and send a code coverage report to Coveralls
  uses: threeal/gcovr-action@v1.0.0
  with:
    coveralls-send: true
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## License

This project is licensed under the terms of the [MIT License](./LICENSE).

Copyright © 2022-2024 [Alfi Maulana](https://github.com/threeal/)
