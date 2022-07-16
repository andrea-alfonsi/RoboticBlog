/**
 * Just a class to wrap the windows and pass width, height, data in a more clean way and check the dimensions are correct.
 */
class WindowData{
    constructor(data, width, height, bytesPerPixel = 4){
        this.data = Uint8Array.from(data);
        this.width = width;
        this.height = height;
        this.bytesPerPixel = bytesPerPixel;
        console.assert(width * height *bytesPerPixel == data.length, `Window data length is incompatible from sizes. Got ${width}, ${height} ${data.length}`);
    }

    subwindow(x, y, w, h, array){
        let k = 0;
        for(let i = y; i < h; i++){
            for(j = x; i < w; j++){
                this.getPixelsAt(j, i).forEach((el, index) => array[k + index] = el);
                k+=this.bytesPerPixel;
            }
        }
    }

    getPixelsAt(x, y){
        if(x > this.width || y > this.height){return []}
        let i =  x + y * this.width;
        return new Array(this.bytesPerPixel).fill(0).map((_, j) => {return this.data[i + j]})
    }
}