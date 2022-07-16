window.onload = () => {
            const robot = new Robot({camerasDistance: 1});
            const scene = new THREE.Scene();

            // Set to false to block the actions. This is done after the cameraL and cameraR 
            //  shot to prevent robot channge the position before the algorithm runs.
            let canCameraDistanceChange = true;
            let canCamerasResize = true;

			const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / 800, 0.1, 1000 );
			const renderer = new THREE.WebGLRenderer({
                    canvas: document.getElementById("scene-canvas"),
                    antialias: true,
                });
            const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
            const robotControls = new RobotControls(camera, orbitControls, robot);
            scene.add(robot);

            populateScene(scene, {  boxes: new Array(10).fill(0).map(() => {return {}}),
                                    spheres: new Array(10).fill(0).map(() => {return {}})});
            
            const light = new THREE.PointLight( 0xffffff, 1, 100 );
            light.position.set( 8, 10, 7 );
            scene.add( light );

			renderer.setSize( window.innerWidth / 2 - 1,  400 );

			camera.position.z = 5;
            camera.position.y = 5;
            camera.lookAt( 0, 0 ,0);

			function animate() {
				requestAnimationFrame( animate );
				renderer.render( scene, camera );
			};



            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / 800;
                renderer.setSize( window.innerWidth / 2 - 1,  400 );
            });
            document.getElementById("toggle-helpers").onclick = (function(){
                let isOn = false;
                return ()=>{
                    isOn ? robot.removeHelpers(scene) : robot.addHelpers(scene);
                    isOn = !isOn;
                }
            })();
            document.getElementById("input-number-boxes").addEventListener("input", function(event){
                let n = this.valueAsNumber - scene.children.filter(el => {return el.type != "Group" && el.type != "PointLight" && el.geometry.type == "BoxGeometry" }).length;
                addOrRemoveElementFromScene(scene, "BoxGeometry", 
                                            { boxes: 
                                                new Array(Math.abs(n)).fill(0).map(() => {return {}})},
                                            this.valueAsNumber);
            });
            document.getElementById("input-number-spheres").addEventListener("input", function(event){
                let n = this.valueAsNumber - scene.children.filter(el => {return el.type != "Group" && el.type != "PointLight" && el.geometry.type == "SphereGeometry" }).length;
                addOrRemoveElementFromScene(scene, "SphereGeometry", 
                                            { spheres: 
                                                new Array(Math.abs(n)).fill(0).map(() => {return {}})},
                                            this.valueAsNumber);
            });
            document.getElementById("input-cameras-distance").addEventListener("input", function(event){
                if (canCameraDistanceChange){
                    robot.setCamerasDistance(this.valueAsNumber);
                }
            })

            // This is the element that start the algorithm.
            document.getElementById("capture-cameras").onclick = (function(){

                // preserveDrawingBuffer is make to not erase the drawing when the pixel values are saved to an array.
                const rendererL = new THREE.WebGLRenderer({
                    canvas: document.getElementById("camera-left"),
                    antialias: true,
                    preserveDrawingBuffer: true,
                });
                const rendererR = new THREE.WebGLRenderer({
                    canvas: document.getElementById("camera-right"),
                    antialias: true,
                    preserveDrawingBuffer: true
                });

                rendererL.setSize((window.innerWidth - 40) / 2 - 1, 200);
                rendererR.setSize((window.innerWidth - 40) / 2 - 1, 200);
                window.addEventListener("resize", () => {
                    if(canCamerasResize){
                        robot.cameraL.aspect = ((window.innerWidth - 40)/2 - 1) / 200; 
                        robot.cameraR.aspect = ((window.innerWidth - 40)/2 - 1) / 200; 
                        rendererL.setSize((window.innerWidth - 40) / 2 - 1, 200);
                        rendererR.setSize((window.innerWidth - 40) / 2 - 1, 200);
                    }
                })
                return () => {
                    rendererL.render(scene, robot.cameraL);
                    rendererR.render(scene, robot.cameraR);

                    // Robot cannot move when when the algorithm starts. It will move again after the distance has been calculated
                    robotControls.off();
                    canCameraDistanceChange = false;
                    canCamerasResize = false;

                    // Wait until the user picksapoint in the left canvas.
                    pickAPointinLeftCanvas(rendererL, rendererR, scene, robot.cameraL, robot.cameraR).then((result) => {

                        let resultSquaredDistanceElement = document.getElementById("result-squared")
                        let resultAbsoluteDistanceElement = document.getElementById("result-absolute")

                        let {windowL, windowR, x, y} = result;
                        let [closestWindowSquaredX, closestWindowAbsoluteX] = findClosestWindow(windowL, windowR);

                        // Print the results rounded to 4 decimals.
                        let decimals = 1e4;
                        resultSquaredDistanceElement.innerText = Math.round(calculateDepth(robot.options.camerasDistance, robot.cameraR.getFocalLength(), x - closestWindowSquaredX) * decimals) / decimals;
                        resultAbsoluteDistanceElement.innerText = Math.round(calculateDepth(robot.options.camerasDistance, robot.cameraR.getFocalLength(), x - closestWindowAbsoluteX) * decimals ) / decimals;
                        
                        // Allow all the components to move again.
                        robotControls.on();
                        canCameraDistanceChange = true;
                        canCamerasResize = true;
                    }).catch((err) => {
                        console.error(err);
                        robotControls.on();
                        canCameraDistanceChange = true;
                        canCamerasResize = true;
                    });
                }
            })();

			animate();
}


// Remove or ad elemets to the scene
function addOrRemoveElementFromScene(scene, type, add, n){
    let number = scene.children.filter(el => {return el.type != "Group" && el.type != "PointLight" && el.geometry.type == type}).length;
    if(number > n){
        let diff = number - n;
        let k = 0;
        scene.children.forEach( el => {
            if( k < diff && el.type != "Group" && el.type != "PointLight" && el.geometry.type == type){
                scene.remove(el);
                k++;
            }
        })
    } else {
        populateScene(scene, add);
    }
}