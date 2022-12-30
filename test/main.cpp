#include <is_even.hpp>
#include <is_odd.hpp>

int main() {
  bool success = true;
#ifdef TEST_EVEN
  success &= is_even(4);
#endif
#ifdef TEST_ODD
  success &= is_odd(5);
#endif
  return success ? 0 : 1;
}
