const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Create a basic light and camera
const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 10, -20), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);

// Create a giant plane for the ground
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, scene);

// Store avatars
let avatars = {};

// Connect to the server
const socket = io();

// Create your avatar
const avatar = BABYLON.MeshBuilder.CreateSphere('avatar', { diameter: 2 }, scene);
avatar.position.y = 1;

// Handle movement keys
let moveDirection = { x: 0, z: 0 };
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': moveDirection.z = 1; break;
        case 's': moveDirection.z = -1; break;
        case 'a': moveDirection.x = -1; break;
        case 'd': moveDirection.x = 1; break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 's': moveDirection.z = 0; break;
        case 'a':
        case 'd': moveDirection.x = 0; break;
    }
});

// Mobile controls
document.getElementById('up').addEventListener('touchstart', () => moveDirection.z = 1);
document.getElementById('down').addEventListener('touchstart', () => moveDirection.z = -1);
document.getElementById('left').addEventListener('touchstart', () => moveDirection.x = -1);
document.getElementById('right').addEventListener('touchstart', () => moveDirection.x = 1);

document.getElementById('up').addEventListener('touchend', () => moveDirection.z = 0);
document.getElementById('down').addEventListener('touchend', () => moveDirection.z = 0);
document.getElementById('left').addEventListener('touchend', () => moveDirection.x = 0);
document.getElementById('right').addEventListener('touchend', () => moveDirection.x = 0);

// Update the avatar's position and send it to the server
engine.runRenderLoop(() => {
    const speed = 0.1;
    avatar.position.x += moveDirection.x * speed;
    avatar.position.z += moveDirection.z * speed;

    socket.emit('move', { x: avatar.position.x, y: avatar.position.z });

    scene.render();
});

// Handle new clients
socket.on('newClient', (data) => {
    const newAvatar = BABYLON.MeshBuilder.CreateSphere(`avatar_${data.id}`, { diameter: 2 }, scene);
    newAvatar.position.x = data.position.x;
    newAvatar.position.z = data.position.y;
    avatars[data.id] = newAvatar;
});

// Handle existing clients when connecting
socket.on('currentClients', (clients) => {
    for (let id in clients) {
        if (id !== socket.id) {
            const newAvatar = BABYLON.MeshBuilder.CreateSphere(`avatar_${id}`, { diameter: 2 }, scene);
            newAvatar.position.x = clients[id].x;
            newAvatar.position.z = clients[id].y;
            avatars[id] = newAvatar;
        }
    }
});

// Handle movement from other clients
socket.on('move', (data) => {
    if (avatars[data.id]) {
        avatars[data.id].position.x = data.position.x;
        avatars[data.id].position.z = data.position.y;
    }
});

// Handle client disconnect
socket.on('removeClient', (id) => {
    if (avatars[id]) {
        avatars[id].dispose();
        delete avatars[id];
    }
});

window.addEventListener('resize', () => {
    engine.resize();
});
