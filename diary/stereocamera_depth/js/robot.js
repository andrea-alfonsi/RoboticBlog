// TODO: add a range input to change the FOV? And when the FOV must be locked and not changed?
const ROBOT_CAMERAS_FOV = 45;
let ROBOT_CAMERAS_ASPECT_RATIO = ((window.innerWidth - 40)/2 - 1) / 200; 

/**
 * The robot is the main actor in the scene. This class allows to move the robot and change the configurations, 
 * and to move all objects attached to the robot correctly.
 */
class Robot extends THREE.Group {
    constructor(options) {
        super();

        this.options = options;
        this.cameraL = new THREE.PerspectiveCamera(ROBOT_CAMERAS_FOV, ROBOT_CAMERAS_ASPECT_RATIO, 1000, .1)
        this.cameraR = new THREE.PerspectiveCamera(ROBOT_CAMERAS_FOV, ROBOT_CAMERAS_ASPECT_RATIO, 1000, .1)
            this.cameraL.position.set( -options.camerasDistance / 2, 0, 0);
            this.cameraR.position.set(  options.camerasDistance / 2, 0, 0);
        this.body = new THREE.Mesh(new THREE.BoxGeometry(1), new THREE.MeshBasicMaterial({color : 0xffffff }));

        this.helpers = [
            new THREE.CameraHelper(this.cameraL),
            new THREE.CameraHelper(this.cameraR),
        ]
        
        this.add(this.cameraL);
        this.add(this.cameraR);
        this.add(this.body);
        
    }

    //============================================= MOVEMENTS =====================================
    // Taken from this fiddle: https://jsfiddle.net/a2nhdqsg/. 
    // Step size has been chosen to be .1 to make the movements more smoot but any small value works fine. 
    // Same reasoning for angles.
    moveForward(stepSize = .1){
        let dir = new THREE.Vector3( 0, 0, -stepSize );
        dir.applyQuaternion( this.quaternion );
        this.position.add(dir);
        return dir;
    }
    moveBack(stepSize = .1){
        let dir = new THREE.Vector3( 0, 0, -stepSize );
        dir.applyQuaternion( this.quaternion );
        this.position.sub(dir);
        return dir;
    }
    rotateLeft(angle = .02){
        this.rotation.y += angle;
    }
    rotateRight(angle = .02){
        this.rotation.y -= angle;
    }
    //============================================== CAMERAS ======================================
    // The script in init.js blocks the elements that can change this value after the user 
    //  starts to pick a window from the left camera canvas.
    setCamerasDistance(camerasDistance){
        this.options.camerasDistance = camerasDistance;
        this.cameraL.position.x = -camerasDistance / 2;
        this.cameraR.position.x = camerasDistance / 2;
    }

    // ============================================= HELPERS ======================================
    // These were very helpful during the prototyping.
    // TODO: change the layer  of the helper so the camerarobot cannot see them eveniff they are active.
    addHelpers(scene){
       this.helpers.forEach(helper => scene.add(helper)) ;
    }
    removeHelpers(scene){
        this.helpers.forEach(helper => scene.remove(helper))
    }
}