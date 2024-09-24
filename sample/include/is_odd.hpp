#pragma once

#include <iostream>

bool is_odd(int val) {
    bool result = ((val % 2) == 1);
    if (result) {
        std::cout << "Result is odd\n";
    } else {
        std::cout << "Result is even\n";
    }
    return result;
}
