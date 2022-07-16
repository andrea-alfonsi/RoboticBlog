/**
 * This class is used to move the robot and the camera in the first canvas  ( the  3rd person view ).
 */
class RobotControls{
    constructor(camera, controls, robot){
        this._on = true;
        this.camera= camera;
        this.robot = robot;
        this.controls = controls;
        this.callback = (event) =>{
            if(this._on){
                let direction;
                switch(event.key){
                    case 'w':
                        direction = robot.moveForward();
                        camera.position.add( direction );
                        controls.target.copy( robot.position );
                        controls.update();
                        break;
                    case 's':
                        direction = robot.moveBack();
                        camera.position.sub( direction );
                        controls.target.copy( robot.position );
                        controls.update();
                        break;
                    
                    case 'a':
                        robot.rotateLeft();
                        break;
                    case 'd':
                        robot.rotateRight();
                }
            }
        };
        window.addEventListener("keypress", this.callback);
    }

    // This functions are used only to pause the movements of the robot once the cameras take the picture and the algorithm runs.
    on(){this._on = true}
    off(){this._on = false}
    remove(){window.removeEventListener("keypress", this.callback)}
    update(){this.controls.update()};
}