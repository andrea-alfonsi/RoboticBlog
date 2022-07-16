/**
 * Let the user pick a square of pixels inside the right canvas and a rectangle of pixels on the left one.  
 * 
 * @param {THREE.WebGLRenderer} rendererL  The renderer of the left canvas
 * @param {THREE.WebGLRenderer} rendererR  The renderer of the right canvas
 * @param {THREE.Scene}         scene      The scene taht containsall the elements
 * @param {THREE.Camera}        cameraL    The left camera of the robot
 * @param {THREE.Camera}        cameraR    The right camera of the robot
 * 
 * @returns The 2 windows selected andthe coodinates of the left window center, relative to the top left corner of the canvas.
 */
const pickAPointinLeftCanvas = (function(){
    // Create the square that moves over the left canvas.
    const rectangle = document.createElement('div');
        rectangle.setAttribute("style", "position: absolute; background: transparent; width: 5px; height: 5px; border: solid 1px white; mix-blend-mode: difference;box-sizing: border-box;");
        rectangle.style.top = "-1000px";
        rectangle.style.left = "-1000px";
        rectangle.innerHTML = "&nbsp;"
        document.body.appendChild(rectangle);

    // Create the rectangle that move over the right canvas.
    const epipolarline = document.createElement("div");
        epipolarline.setAttribute("style", "position: absolute; display: block; background: transparent; border: solid 1px white; mix-blend-mode: difference; top: -1000px; left: -1000px; height: 5px; box-sizing:border-box;")
        document.body.appendChild(epipolarline);
    
    // Create a layer over the right canvas with x-index = 2, that listen for mousemovements. 
    // When the mouse movesfrom the canvas to the rectangle the onmousemove element target changes. To prevent adding 2 listeners
    //  ( one on canvas andone on rectangle ) the layer element is added and positioned over the canvas, so it listen for all mouse events.
    const layer = document.createElement("div");
        layer.setAttribute("style", "position: absolute; display: block; background: transparent; z-index: 2; top: -1000px; left: -1000px; cursor: crosshair;")
        layer.innerHTML = "&nbsp;"
        document.body.append(layer);

    // The setSize function updates the rectangleSize variable and calculates the new coordinates of rectangle and epopolarline 
    //  to keep the center at mouse cordinates.
    let rectangleSize = 5;
    const setSize = (size) => {
        size = Math.min(Math.max(size, 5), 50)
        let top = parseFloat(rectangle.style.top) + rectangleSize / 2;
        let left = parseFloat(rectangle.style.left) + rectangleSize / 2;
        let epipolarTop =  parseFloat(epipolarline.style.top) + rectangleSize / 2;
        let epipolarLeft = epipolarline.style.left;
        let epipolarWidth = epipolarline.style.width;
        
        rectangleSize = size;

        rectangle.setAttribute("style", `position: absolute; background: transparent; width: ${rectangleSize}px; height: ${rectangleSize}px; border: solid 1px white; mix-blend-mode: difference; box-sizing: border-box;`)
        rectangle.style.top = top - rectangleSize / 2 + "px";
        rectangle.style.left = left - rectangleSize / 2 + "px";

        epipolarline.setAttribute("style", `position: absolute; display: block; background: transparent; border: solid 1px white; mix-blend-mode: difference; height: ${rectangleSize}px; box-sizing: border-box;`)
        epipolarline.style.top = epipolarTop - rectangleSize / 2 + "px";
        epipolarline.style.left = epipolarLeft;
        epipolarline.style.width =  epipolarWidth;

    }

    // The mousemove callback function is not a lambda to allw removing the listener after the user picks a point in the canvas.
    const mouseMove = (event) => {
        rectangle.style.top = event.pageY - rectangleSize / 2+ "px";
        rectangle.style.left = event.pageX - rectangleSize / 2 + "px";
        epipolarline.style.top = event.pageY - rectangleSize / 2 + "px";
    }

    // The mousescroll callback function is not a lambda to allw removing the listener after the user picks a point in the canvas.
    const mouseScroll = (event) => {
        setSize(rectangleSize + event.wheelDelta)
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // This is the real function that is called. Returns a promise that resolves when the user picks a point.
    // TODO: the camera renders the objects in the wrong order. I followed the tutorial but it doesn't work ( maybe is an error of THREE? )
    //       Don't know why but should not affect how the algorithm works, so i'll ignore it.
    return (rendererL, rendererR, scene, cameraL, cameraR) => {
        return new Promise((resolve, reject)  => {
            let canvasL = rendererL.domElement;
            let canvasRect = canvasL.getBoundingClientRect();
            // move the layer and the epiloarline over the  left canvas
                layer.style.top = canvasRect.top + window.scrollY + "px";
                layer.style.left = canvasRect.left + window.scrollX + "px";
                layer.style.width = canvasRect.width + "px";
                layer.style.height = canvasRect.height + "px";
                epipolarline.style.left = canvasRect.right + window.scrollX + "px";
                epipolarline.style.width = canvasRect.width + "px";
            
            
            layer.addEventListener("mousemove", mouseMove);
            layer.addEventListener("wheel", mouseScroll, {passive: false});
            layer.onclick = () => {
                // Move the layer outside the view and remove all listeners
                layer.style.top = "-1000px";
                layer.style.left = "-1000px";
                layer.removeEventListener("mousemove", mouseMove);
                layer.removeEventListener("wheel", mouseScroll);

                let rectangleRect = rectangle.getBoundingClientRect();
                let epipolarlineRect = epipolarline.getBoundingClientRect();
                let canvasLRect = rendererL.domElement.getBoundingClientRect();
                let canvasRRect = rendererR.domElement.getBoundingClientRect();

                // Render what the left cameras sees and save the selected window as an array of RGBA pixels. 
                // The render is done again because the webgl canvas may be erased from a new drawing event.
                rendererL.render(scene, cameraL);
                windowL = readPixelsFromCanvas(rendererL.getContext(), 
                                            parseInt(rectangleRect.left),
                                            parseInt(canvasLRect.height - rectangleRect.bottom + canvasLRect.top),
                                            rectangleSize,
                                            rectangleSize);
                rendererR.render(scene, cameraR);
                windowR = readPixelsFromCanvas(rendererR.getContext(),
                                            0,
                                            parseInt(canvasRRect.height - epipolarlineRect.bottom + canvasRRect.top),
                                            parseInt(epipolarlineRect.width), 
                                            rectangleSize);

                resolve({ windowL: new WindowData(windowL, rectangleSize, rectangleSize, 4), 
                          windowR: new WindowData(windowR, parseInt(epipolarlineRect.width), rectangleSize, 4),
                          x: rectangleRect.left + rectangleSize,
                          y: rectangleRect.bottom - canvasLRect.top + rectangleSize});
            }
        });
        
    }
})();