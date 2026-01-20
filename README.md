# Gcovr Action

Check test coverage and generate reports for C/C++ projects using [gcovr](https://gcovr.com/en/stable/) on [GitHub Actions](https://github.com/features/actions).

## Key Features

- Check test coverage for C/C++ projects compiled with [GCC](https://gcc.gnu.org/) and [LLVM Clang](https://clang.llvm.org/).
- Generate test coverage reports in HTML, [Cobertura](https://cobertura.github.io/cobertura/), and [Coveralls](https://coveralls.io/) formats.
- Support file exclusion and fail if coverage is below a specific threshold.
- Support sending reports directly to Coveralls.
- Automatically install and cache the gcovr program on GitHub Actions.

## Available Inputs

The following table lists all available inputs supported by this action. Please note that these inputs are optional.

| Name | Value Type | Description |
| --- | --- | --- |
| `root` | Path | Root directory of your source files. Defaults to the current directory. File names are reported relative to this directory. |
| `gcov-executable` | Executable name with optional arguments | Use a specific [gcov](https://gcc.gnu.org/onlinedocs/gcc/Gcov.html) executable. It must match the compiler you are using, e.g., `llvm-cov gcov` for LLVM Clang. |
| `excludes` | One or more regular expression patterns | Exclude source files that match these filters. |
| `filter` | One or more regular expression patterns | Filter source files that match these filters. |
| `fail-under-line` | 0 - 100 | Fail if the total line coverage is less than this value. |
| `fail-under-branch` | 0 - 100 | Fail if the total branch coverage is less than this value. |
| `fail-under-function` | 0 - 100 | Fail if the total function coverage is less than this value. |
| `fail-under-decision` | 0 - 100 | Fail if the total decision coverage is less than this value. |
| `html-out` | Path | Output file for the generated HTML report. |
| `html-details` | `true` or `false` | Enable to add annotated source code reports to the HTML report. Defaults to `false`. |
| `html-theme` | String | Override the default color theme for the HTML report. |
| `html-title` | String | Override the default title for the HTML report. |
| `xml-out` | Path | Output file for the generated Cobertura report. |
| `coveralls-out` | Path | Output file for the generated Coveralls report. |
| `coveralls-send` | `true` or `false` | Send the generated Coveralls report to its endpoint. Defaults to `false`. |
| `decisions` | `true` or `false` | Report the decision coverage in HTML, JSON, and summary reports. Defaults to `false`. |
| `calls` | `true` or `false` | Report the calls coverage in HTML and summary reports. Defaults to `false`. |
| `jobs` | `true`, `false`, or number | Set the number of threads to use in parallel. When set to `true` without a number, uses all available processors. Defaults to `false`. |
| `print-summary` | `true` or `false` | Print a small report to stdout showing line, function, branch percentage coverage with optional decision & call coverage. This is in addition to other reports. Defaults to `false`. |
| `github-token` | Token | [GitHub token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) for your project. Defaults to [`github.token`](https://docs.github.com/en/actions/security-guides/automatic-token-authentication). Required for successfully sending the Coveralls report to its endpoint. |
| `working-directory` | Path | The working directory where gcovr should be executed. |
| `cobertura-out` | Path | Generate a Cobertura XML report. |
| `cobertura-pretty` | `true` or `false` | Pretty-print the Cobertura XML report. Defaults to `false`. |
| `jacoco-out` | Path | Output file for the generated JaCoCo report. |
| `json-out` | Path | Generate a JSON report. |
| `json-pretty` | `true` or `false` | Pretty-print the JSON report. Defaults to `false`. |
| `json-summary-out` | Path | Generate a JSON summary report. |
| `json-summary-pretty` | `true` or `false` | Pretty-print the JSON SUMMARY report. Defaults to `false`. |
| `lcov-out` | Path | Generate LCOV coverage report. |
| `sonarqube-out` | Path | Generate sonarqube generic coverage report. |
| `txt-out` | Path | Output file for the generated text report. |

## Example Usages

This example demonstrates how to use this action to check test coverage of a C/C++ project on GitHub Actions. By default, if no other inputs are given, this action will print the test coverage report to the log.

```yaml
name: test
on:
  push:
jobs:
  test-project:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout Project
        uses: actions/checkout@v5.0.0

      - name: Build Project
        uses: threeal/cmake-action@v2.1.0

      - name: Test Project
        uses: threeal/ctest-action@v1.1.0

      - name: Check Test Coverage
        uses: threeal/gcovr-action@v1.2.0
```

### Specify Test Coverage Threshold

To specify the minimum required test coverage threshold, set the `fail-under-line`, `fail-under-branch`, and/or `fail-under-function` inputs with a number ranging from 0-100 indicating the percentage of the threshold. For example, the following will check and assert if the test line coverage is above 80%:

```yaml
- name: Check Test Coverage
  uses: threeal/gcovr-action@v1.2.0
  with:
    fail-under-line: 80
```

### Generate HTML Report

Specify the `html-out` input to generate the test coverage report in HTML format:

```yaml
- name: Generate HTML Report
  uses: threeal/gcovr-action@v1.2.0
  with:
    html-out: coverage.html
```

Other options are also available to customize the generated HTML output:

```yaml
- name: Generate HTML Report
  uses: threeal/gcovr-action@v1.2.0
  with:
    html-out: coverage.html
    html-details: true
    html-title: My Project Test Coverage Report
    html-theme: github.green
```

### Generate Cobertura Report

Specify the `xml-out` input to generate the test coverage report in Cobertura format:

```yaml
- name: Generate Cobertura Report
  uses: threeal/gcovr-action@v1.2.0
  with:
    xml-out: cobertura.xml
```

### Generate Coveralls Report

Specify the `coveralls-out` input to generate the test coverage report in Coveralls format:

```yaml
- name: Generate Coveralls Report
  uses: threeal/gcovr-action@v1.2.0
  with:
    coveralls-out: coveralls.json
```

Rather than outputting the report as a file, it can also be directly sent to Coveralls by setting the `coveralls-send` input to `true`:

```yaml
- name: Send Coveralls Report
  uses: threeal/gcovr-action@v1.2.0
  with:
    coveralls-send: true
```

### Using LLVM Clang

By default, gcovr works well with projects compiled using GCC. However, for projects compiled using LLVM Clang, the `gcov-executable` input must correctly specify the `gcov` program that works with that compiler. See [this](https://gcovr.com/en/stable/guide/compiling.html#choosing-the-right-gcov-executable) for more details.

```yaml
- name: Check Test Coverage
  uses: threeal/gcovr-action@v1.2.0
  with:
    gcov-executable: llvm-cov gcov
```

## License

This project is licensed under the terms of the [MIT License](./LICENSE).

Copyright © 2022-2026 [Alfi Maulana](https://github.com/threeal/)
