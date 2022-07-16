#include <stdio.h>
#include <stdint.h>
#include <iostream>
#include <functional>

// Enum to indicate which algorithm are implemented.
enum ALGORITHM {
    SUM_SQUARED_DIFFERENCE = 0,
    SUM_ABSOLUTE_DIFFERENCE = 1
};

using difference_function_t = std::function<double(int)>;
void iterate_over_each_pixel(uint8_t*, uint8_t*, size_t, size_t, double*, difference_function_t const&);

#ifdef __EMSCRIPTEN__
    #include <emscripten.h>
    #include <emscripten/bind.h>
        EMSCRIPTEN_KEEPALIVE
    extern "C" {
#endif
/**
 * @brief Check each sub-window inside the window2 to find the most similar to teh window1. 
 * Stores the score of each subwindow in the result array, where the index of the array 
 *  is x coordinate of the left most pixel of the window.
 * 
 * @param window1   A pointer to the array containing the pixels of the first window
 * @param window2   A pointer to the array containing the pixels of the second window
 * @param size      The width/height of the first window
 * @param width2    The width of the second window
 * @param algorithm The value of the enum that indicates which algorithm to choose
 * @param result    The pointer to the array containg the score of the differences
 */
void find_most_similar_window(uint8_t* window1, uint8_t* window2, size_t size, size_t width2, ALGORITHM algorithm, double* result)
{
    if(algorithm == ALGORITHM::SUM_SQUARED_DIFFERENCE){
        auto func = [](int diff){ return (double)(diff * diff);};
        iterate_over_each_pixel(window1, window2, size, width2, result, func);
    } else if (algorithm == ALGORITHM::SUM_ABSOLUTE_DIFFERENCE){
        auto func = [](int diff){ return (double)(diff > 0 ? diff : -diff); };
        iterate_over_each_pixel(window1, window2, size, width2, result, func);
    } else {
        std::cout << "Invalid algorithm / not supported algorithm" << std::endl;;
    }
}

#ifdef __EMSCRIPTEN__
    }

    // Export the enum values to javascript.
    EMSCRIPTEN_BINDINGS(example) {
    emscripten::enum_<ALGORITHM>("ALGORITHM")
        .value("SUM_SQUARED_DIFFERENCE", SUM_SQUARED_DIFFERENCE)
        .value("SUM_ABSOLUTE_DIFFERENCE", SUM_ABSOLUTE_DIFFERENCE)
        ;
    };
#endif

/**
 * @brief Iterate over each sub-window of the window2 and calculte the score of the window. 
 *        The results are stored inside the result array.
 * 
 * @param window1 A pointer to the array containing the pixels of the first window
 * @param window2 A pointer to the array containing the pixels of the second window
 * @param size    The width/height of the first window
 * @param width2  The width of the second window
 * @param result  The pointer to the array containg the score of the differences
 * @param func    The callback function that accepts the difference of pixels as integer and applies some math functions
 */
void iterate_over_each_pixel(uint8_t* window1, uint8_t* window2, size_t size, size_t width2, double* result, difference_function_t const& func){
    for(size_t k = 0; k  < width2; k++){
            result[k] = 0.0;
            for(size_t i = 0; i < size; i++){
                for(size_t j = 0; j < size; j++){
                    // The values are multiplied by 4 because each pixel contains RGBA values.
                    size_t indexR = (k + i + j * width2) * 4;
                    size_t indexL = (i + j * size) * 4;
                    if(k + i > width2){
                        // The value 3 can be increased to punish more the algorithm if it compares 
                        // windows outside the window2 boundaries.
                        result[k] += 3.0 * func(255.0);
                    } else {
                        // Iterate over the next 3 pixels because the 4th is alwways the alpha.
                        for(size_t z = 0; z < 3; z++){
                            int difference = (unsigned int)window1[indexL + z] - (unsigned int)window2[indexR + z];
                            result[k] += func(difference);
                        }
                    }
                }
            }
        }
}