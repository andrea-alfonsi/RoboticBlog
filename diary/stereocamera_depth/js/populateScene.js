/**
 * This is an helper to  add shapes to the scene dinamically.
 * 
 * @param { THREE.Scene } scene   The scene where the object will be added
 * @param { object }      options An object like {
 *                                                  boxes: [{size: number, color: number, position: THREE.Vector3}, ...]
 *                                                  spheres: [{size: number, color: number, position: THREE.Vector3}, ...]
 *                                               }
 */
function populateScene(scene, options){
    function randomColor(){
        let randomColor = '';
        for (let count = 0; count < 6; count++) {
            randomColor += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
        }
        return parseInt(randomColor ,16);
    }

    function randomPosition( min, max ){
        let position =  new THREE.Vector3().random();
        position.y = 0;
        position.x = position.x * (Math.random() > .5 ? 1 : -1);
        position.z = position.z * (Math.random() > .5 ? 1 : -1);
        position.setLength(Math.random()*(max-min) + min);
        return position;
    }

    options?.boxes?.forEach(box => {
        let mesh = new THREE.Mesh( new THREE.BoxGeometry( box.size ?? 1 ), new THREE.MeshToonMaterial({ color: box.color ?? randomColor()}))
        box.position ? mesh.position.copy(box.position) : mesh.position.copy( randomPosition(2, 10) );
        scene.add(mesh)
    });
    options?.spheres?.forEach(sphere => {
        let mesh = new THREE.Mesh( new THREE.SphereGeometry(sphere.size ?? 1), new THREE.MeshToonMaterial({color: sphere.color ?? randomColor()}));
        sphere.position ? mesh.position.copy(sphere.position) : mesh.position.copy( randomPosition(2, 10) );
        scene.add(mesh);
    })
}