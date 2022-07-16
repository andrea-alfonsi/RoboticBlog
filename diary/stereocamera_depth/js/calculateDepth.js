// Crate the element dpi giving dimensions in inches so we can get th device DPI from javascript. 
// This is not necessary for the algorithm because THREEJS doesn't use units, but canbe useful to show 
//  how the same point can give different result if taken with different pixel sizes.
let dpi = document.createElement("div");
dpi.setAttribute("style", "height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;");
document.body.appendChild(dpi);

/**
 * This function just does the calculations, so to get useful informations convert to same units before calling the function/
 *!  Only the horizonatal distance is calculated.
 * @param {number} baseline         The distance betweenthe cameras
 * @param {number} focalLength      The focal length of the cameras ( suppose they are equal )
 * @param {number} pixelDisparity   The distance in pixel of the windows
 * @param {number} pixelSize        The size of each pixel
 * @returns {number}                The esitmated depth of the pixel
 */
function calculateDepth(baseline, focalLength, pixelDisparity, pixelSize = dpi.offsetHeight ){
    return Math.abs((baseline * focalLength)/(pixelDisparity * pixelSize));
}