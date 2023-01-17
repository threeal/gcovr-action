cmake_minimum_required(VERSION 3.0)
project(test)

option(TEST_EVEN "test is_even function" ON)
option(TEST_ODD "test is_odd function" ON)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fprofile-arcs -ftest-coverage -O0")

add_executable(main main.cpp)
target_include_directories(main PRIVATE include)
target_compile_definitions(
  main PRIVATE
  $<$<BOOL:${TEST_EVEN}>:TEST_EVEN>
  $<$<BOOL:${TEST_ODD}>:TEST_ODD>
)

enable_testing()
add_test(NAME main COMMAND $<TARGET_FILE:main>)
