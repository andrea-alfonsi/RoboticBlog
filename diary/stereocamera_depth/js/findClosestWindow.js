/**
 * Iterates over each pixel and calculate the difference score of the windows. Lower score = more similar.
 * 
 * @param { Window } windowL  The window of of the left camera
 * @param { Window } windowR  The window of the right camera
 * @returns An array with the coordinates of the lowest score of each algorithm used
 */
function findClosestWindow(windowL, windowR){
    // Find the svg element where to plot the score of each window. and erase all elements inside.
    let svgElement = document.getElementById('window-differences');
    svgElement.innerHTML = "";
    let svgRect = svgElement.getBoundingClientRect();

    // Allocate the data to the WASM memory. The value returnd from _malloc are pointers to the data in the stack.
    let windowLOffset = Module._malloc(windowL.data.length);
    let windowROffset = Module._malloc(windowR.data.length);
    
    // Copy the data from the Uint8Array of pixels to the stack.
    Module.HEAPU8.set(windowL.data, windowLOffset);
    Module.HEAPU8.set(windowR.data, windowROffset);
    
    // Get the function to calculate the scores.
    const func = Module.cwrap("find_most_similar_window", null, ["number", "number", "number", "number","number", "number"]);

    // Compute the scores with all the algorithms available. Actually only SumSuared and SumAbsolute are implemented.
    let lines = new Array(2).fill(0).map((el, i) => {
        return calculateWindowDifference(windowL, windowLOffset, windowR, windowROffset, i, func)});

    // Plt the results in the svg element.
    lines.forEach((line, i) => {
        let min = Math.min(...line);
        let max = Math.max(...line);

        // calcualte the coordiantes of the left most point in the plot.
        let d = "M 0," + ( 1 - (line[0] - min)/(max-min))*(svgRect.height) + " ";

        for(let i = 1; i < line.length; i++){
            // Add a new line to the plot path.
            d += `L ${i*(svgRect.width / line.length)},${ ( 1 - (line[i] - min)/(max-min))*(svgRect.height) } `;
        }

        // Create the path element.
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill" , "none");
        path.setAttribute("stroke", ["red", "blue","green", "yellow", "black"][i % 5]);
        svgElement.appendChild(path);

        // Create the vertical dashed line that indicates the lowest score.
        let minline = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // find the coordiantes of the lowest score.
        let x = line.indexOf(Math.min(...line))*(svgRect.width / line.length);
        minline.setAttribute("d" , `M ${x},0 V ${x},${svgRect.height + 100}`)
        minline.setAttribute("fill", "none");
        minline.setAttribute("stroke-dasharray", 15);
        minline.setAttribute("stroke", ["red", "blue","green", "yellow", "black"][i % 5]);
        svgElement.appendChild(minline);
    })

    // Find the lowest score of each line 
    return lines.map(line => { return line.indexOf(Math.min(...line)) });
}


function calculateWindowDifference(windowL, windowLOffset, windowR, windowROffset, algorithm, func){
    // The result is made of a vector of length windowR.width of FLOAT64 values ( each occupies 8 byte ).
    let resultOffset = Module._malloc(windowR.width * 8);
    
    // Call the "find_most_similar_window" defined in the c++ file.
    func(windowLOffset, windowROffset, windowL.height, windowR.width, algorithm, resultOffset);

    // Copy the values from the stack to a new array.
    return Module.HEAPF64.subarray(resultOffset/8, resultOffset/8 + windowR.width);

}