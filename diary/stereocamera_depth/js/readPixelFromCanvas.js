/**
 * Read a rectangle of pixels from a 3D ccanvas. 
 * The xy coordinates are the  coordinates of the lower left corner of the rectangle
 *  
 * @param {WebGL2RenderingContext} glContext    The context of the canvas
 * @param {number} x                            The x coordinates of the lower left corner
 * @param {number} y                            The y coordinates of the lower left corner
 * @param {number} width                        The width of the rectangle 
 * @param {number} height                       The height of the rectangle
 * @returns {Uint8Array}                        The array with the RGB/RGBA values 
 */
function readPixelsFromCanvas(glContext, x, y,  width, height){
    // https://stackoverflow.com/questions/41969562/how-can-i-flip-the-result-of-webglrenderingcontext-readpixels
    let bytesPerPixel = 4;
    let pixels = new Uint8Array(width * height * bytesPerPixel);
    glContext.readPixels(x, y, width, height, glContext.RGBA, glContext.UNSIGNED_BYTE, pixels);

    var halfHeight = height / 2 | 0;  // the | 0 keeps the result an int
    var bytesPerRow = width * bytesPerPixel;

    // make a temp buffer to hold one row
    let temp = new Uint8Array(width * bytesPerPixel);
    for (let y = 0; y < halfHeight; ++y) {
        let topOffset = y * bytesPerRow;
        let bottomOffset = (height - y - 1) * bytesPerRow;
        // make copy of a row on the top half
        temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));
        // copy a row from the bottom half to the top
        pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
        // copy the copy of the top half row to the bottom half 
        pixels.set(temp, bottomOffset);
    }

    return pixels;
}