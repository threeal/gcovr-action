# Gcovr Action

[![latest version](https://img.shields.io/github/v/release/threeal/gcovr-action)](https://github.com/threeal/gcovr-action/releases/)
[![license](https://img.shields.io/github/license/threeal/gcovr-action)](./LICENSE)
[![test status](https://img.shields.io/github/actions/workflow/status/threeal/gcovr-action/test.yml?label=test&branch=main)](https://github.com/threeal/gcovr-action/actions/workflows/test.yml)

Generate code coverage report for C++ project on [GitHub Actions](https://github.com/features/actions) using [gcovr](https://gcovr.com/en/stable/).

## Usage

For more information, see [action.yml](./action.yml) and the [GitHub Actions guide](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions).

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
        run:  |
          cmake test -B build
          cmake --build build
          ctest --test-dir build

      - name: Generate code coverage report
        uses: threeal/gcovr-action@latest
```

## License

This project is maintained by [Alfi Maulana](https://github.com/threeal) and licensed under the [MIT License](./LICENSE).
