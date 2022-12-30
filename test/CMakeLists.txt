cmake_minimum_required(VERSION 3.0)
project(example)

add_library(example INTERFACE)
target_include_directories(example INTERFACE include)
