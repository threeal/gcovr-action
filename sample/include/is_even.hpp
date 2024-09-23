#pragma once

#include <iostream>

bool is_even(int val) {
    bool result = ((val % 2) == 0);
    if (result) {
        std::cout << "Result is even\n";
    } else {
        std::cout << "Result is odd\n";
    }
    return result;
}
