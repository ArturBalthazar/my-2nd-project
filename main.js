console.log("main.js is loaded");

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 4, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create a ground plane
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);

    // Create a sphere as the "avatar"
    const avatar = BABYLON.MeshBuilder.CreateSphere("avatar", { diameter: 2 }, scene);
    avatar.position.y = 1;

    // Movement variables
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    // Handle keyboard input
    window.addEventListener("keydown", (event) => {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                moveForward = true;
                break;
            case 's':
            case 'ArrowDown':
                moveBackward = true;
                break;
            case 'a':
            case 'ArrowLeft':
                moveLeft = true;
                break;
            case 'd':
            case 'ArrowRight':
                moveRight = true;
                break;
        }
    });

    window.addEventListener("keyup", (event) => {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                moveForward = false;
                break;
            case 's':
            case 'ArrowDown':
                moveBackward = false;
                break;
            case 'a':
            case 'ArrowLeft':
                moveLeft = false;
                break;
            case 'd':
            case 'ArrowRight':
                moveRight = false;
                break;
        }
    });

    // Handle button input
    document.getElementById('upButton').addEventListener('mousedown', () => moveForward = true);
    document.getElementById('upButton').addEventListener('mouseup', () => moveForward = false);
    document.getElementById('downButton').addEventListener('mousedown', () => moveBackward = true);
    document.getElementById('downButton').addEventListener('mouseup', () => moveBackward = false);
    document.getElementById('leftButton').addEventListener('mousedown', () => moveLeft = true);
    document.getElementById('leftButton').addEventListener('mouseup', () => moveLeft = false);
    document.getElementById('rightButton').addEventListener('mousedown', () => moveRight = true);
    document.getElementById('rightButton').addEventListener('mouseup', () => moveRight = false);

    scene.onBeforeRenderObservable.add(() => {
        if (moveForward) {
            avatar.position.z -= 0.1;
        }
        if (moveBackward) {
            avatar.position.z += 0.1;
        }
        if (moveLeft) {
            avatar.position.x -= 0.1;
        }
        if (moveRight) {
            avatar.position.x += 0.1;
        }
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});
