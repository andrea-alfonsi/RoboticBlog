mkdir -p ../build
mkdir -p ../build/g++
g++ -Wall -Wextra -Wshadow -Wnon-virtual-dtor -pedantic -Wunused -Wcast-align -Woverloaded-virtual -Wmisleading-indentation -Wduplicated-cond -Wduplicated-branches -Wnull-dereference -Wformat=2 -o ../build/g++/$(echo $1 | cut -f 1 -d '.') $@ 
./../build/g++/$(echo $1 | cut -f 1 -d '.')

# The next lines requrie clang to be isntalled. To install it run:
# * sudo apt update
# * sudo apt install clang

# If clang is installed, de-comment the following lines
mkdir -p ../build/clang++
clang++ -Wall -Wextra -Wshadow -Wnon-virtual-dtor -pedantic -Wunused -Wcast-align -Woverloaded-virtual -Wmisleading-indentation -Wduplicated-cond -Wduplicated-branches -Wnull-dereference -Wformat=2 -Wlifetime -o ../build/clang++/$(echo $1 | cut -f 1 -d '.') $@ 
./../build/clang++/$(echo $1 | cut -f 1 -d '.')
