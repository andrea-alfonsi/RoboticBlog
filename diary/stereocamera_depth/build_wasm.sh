emcc -o build/DepthEstimator.js \
    --std=c++11 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s "EXPORTED_FUNCTIONS=['_find_most_similar_window']" \
    -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    cpp/compareWindows.cpp \
     --bind -lembind