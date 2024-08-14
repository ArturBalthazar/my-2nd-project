const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;

    // Camera setup
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), scene);
    camera.radius = 10; // Distance from the target
    camera.heightOffset = 4; // Height of the camera from the target
    camera.rotationOffset = 0; // The viewing angle (0 is from behind)
    camera.cameraAcceleration = 0.05; // Camera acceleration
    camera.maxCameraSpeed = 10; // Max speed of the camera

    camera.attachControl(canvas, true);

    // Light setup
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Ground setup
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    ground.checkCollisions = true;

    // Create obstacles
    const obstacles = [];
    for (let i = 0; i < 10; i++) {
        const obstacle = BABYLON.MeshBuilder.CreateBox(`obstacle${i}`, { size: 3 }, scene);
        obstacle.position = new BABYLON.Vector3(
            Math.random() * 40 - 20,
            1.5,
            Math.random() * 40 - 20
        );
        obstacle.checkCollisions = true;
        obstacles.push(obstacle);
    }

    // Avatar (Sphere) setup
    const avatar = BABYLON.MeshBuilder.CreateSphere("avatar", { diameter: 2 }, scene);
    avatar.position = new BABYLON.Vector3(0, 1, 0);
    avatar.checkCollisions = true;
    avatar.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    avatar.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    // Assign the camera to follow the avatar
    camera.lockedTarget = avatar;

    // Physics
    scene.enablePhysics();

    // Move the sphere with keyboard inputs
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyDownTrigger,
            (evt) => {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }
        )
    );

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyUpTrigger,
            (evt) => {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
            }
        )
    );

    scene.registerBeforeRender(() => {
        let deltaTime = engine.getDeltaTime() / 1000;

        let forward = new BABYLON.Vector3(
            Math.sin(avatar.rotation.y),
            0,
            Math.cos(avatar.rotation.y)
        );
        let right = new BABYLON.Vector3(
            Math.sin(avatar.rotation.y + Math.PI / 2),
            0,
            Math.cos(avatar.rotation.y + Math.PI / 2)
        );

        if (inputMap["w"]) {
            avatar.moveWithCollisions(forward.scale(5 * deltaTime));
        }
        if (inputMap["s"]) {
            avatar.moveWithCollisions(forward.scale(-5 * deltaTime));
        }
        if (inputMap["a"]) {
            avatar.moveWithCollisions(right.scale(-5 * deltaTime));
        }
        if (inputMap["d"]) {
            avatar.moveWithCollisions(right.scale(5 * deltaTime));
        }

        // Check if the avatar is falling off the plane
        if (avatar.position.y < -10) {
            avatar.position = new BABYLON.Vector3(0, 5, 0);
        }
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});
