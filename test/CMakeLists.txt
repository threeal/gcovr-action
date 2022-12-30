cmake_minimum_required(VERSION 3.0)
project(test)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fprofile-arcs -ftest-coverage -fPIC -O0")

add_library(lib INTERFACE)
target_include_directories(lib INTERFACE include)

add_executable(example_test test/example_test.cpp)
target_link_libraries(example_test PRIVATE lib)

enable_testing()
add_test(NAME example_test COMMAND $<TARGET_FILE:example_test>)
