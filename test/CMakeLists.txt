cmake_minimum_required(VERSION 3.0)
project(test)

option(TEST_EVEN "test is_even function" ON)
option(TEST_ODD "test is_odd function" ON)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fprofile-arcs -ftest-coverage -fPIC -O0")

add_executable(main main.cpp)
target_include_directories(main PRIVATE include)
if(TEST_EVEN)
  target_compile_definitions(main PRIVATE TEST_EVEN)
endif()
if(TEST_ODD)
  target_compile_definitions(main PRIVATE TEST_ODD)
endif()

enable_testing()
add_test(NAME main COMMAND $<TARGET_FILE:main>)
