# Gcovr Action

[![latest version](https://img.shields.io/github/v/release/threeal/gcovr-action)](https://github.com/threeal/gcovr-action/releases/)
[![license](https://img.shields.io/github/license/threeal/gcovr-action)](./LICENSE)
[![test status](https://img.shields.io/github/actions/workflow/status/threeal/gcovr-action/test.yml?label=test&branch=main)](https://github.com/threeal/gcovr-action/actions/workflows/test.yml)

Generate code coverage report for C++ project on [GitHub Actions](https://github.com/features/actions) using [gcovr](https://gcovr.com/en/stable/).

## Usage

For more information, see [action.yml](./action.yml) and the [GitHub Actions guide](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions).

### Inputs

> Note: All inputs are optional.

| Name | Value Type | Description |
| --- | --- | --- |
| `root` | Path | The root directory of your source files. Defaults to current directory. File names are reported relative to this root. |
| `gcov-executable` | Executable name with optional arguments | Use a particular gcov executable. Must match the compiler you are using, e.g. `llvm-cov gcov` for [LLVM](https://llvm.org/). See [this](https://docs.coveralls.io/api-introduction). |
| `exclude` | Regular expression | Exclude source files that match this filter. |
| `fail-under-line` | 0 - 100 | Fail if the total line coverage is less than this value. |
| `coveralls-out` | Path | Output file of generated Coveralls API coverage report. |
| `coveralls-send` | `true` or `false` | Send Coveralls API coverage report to it's endpoint (default: `false`). |
| `coveralls-repo-token` | Token | Coveralls repo token, required for sending Coveralls API coverage report successfully. See [this](https://docs.coveralls.io/api-introduction).

### Standard Example

```yaml
name: test
on:
  push:
jobs:
  test-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3.2.0

      - name: Build and test project
        run: |
          cmake . -B build
          cmake --build build
          ctest --test-dir build

      - name: Generate code coverage report
        uses: threeal/gcovr-action@latest
```

### Using LLVM

```yaml
- name: Build and test project
  run: |
    cmake . -B build -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++
    cmake --build build
    ctest --test-dir build

- name: Generate code coverage report
  uses: threeal/gcovr-action@latest
  with:
    gcov-executable: llvm-cov gcov
```

### Send to Coveralls

```yaml
- name: Generate and send code coverage report to Coveralls
  uses: threeal/gcovr-action@latest
  with:
    coveralls-send: true
    coveralls-repo-token: ${{ secrets.COVERALLS_REPO_TOKEN }}
```

## License

This project is maintained by [Alfi Maulana](https://github.com/threeal) and licensed under the [MIT License](./LICENSE).
