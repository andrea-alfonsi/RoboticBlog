# Depth estimation using a stereocamera

## Run
Open [index.html](https://github.com/andrea-alfonsi/RoboticBlog/blob/main/diary/stereocamera_depth/index.html) with any available server. Opening it as file may generate errors because of security.
The easiest way to run a server is to run the following commands:

```
cd path/to/this/directory
python3 -m http.server
```

Then connect to [localhost](localhost:8000)

## Compile 

Some part of the code is written in c++ and must be compiled to wasm. The files have already been commited insidethe build fonder, but if you make any change run the file [build_wasm.sh](https://github.com/andrea-alfonsi/RoboticBlog/blob/main/diary/stereocamera_depth/build_wasm.sh) before checking the changes. 