// --- Building hover and click animation ---
const buildingHoverStates = {};

function onDocumentMouseMoveBuildings(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  Object.entries(buildingMeshes).forEach(([name, mesh]) => {
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      if (!buildingHoverStates[name]) {
        buildingHoverStates[name] = true;
        animateBuildingHover(mesh, true);
      }
    } else {
      if (buildingHoverStates[name]) {
        buildingHoverStates[name] = false;
        animateBuildingHover(mesh, false);
      }
    }
  });
}

window.addEventListener('mousemove', onDocumentMouseMoveBuildings);

function animateBuildingHover(mesh, hovering) {
  const startScale = mesh.scale.clone();
  const origScale = mesh.userData.origScale || mesh.scale.clone();
  mesh.userData.origScale = origScale;
  const targetScale = hovering ? origScale.clone().multiplyScalar(1.18) : origScale.clone();
  let progress = 0;
  const duration = 150;
  const startTime = performance.now();
  function animate() {
    progress = Math.min((performance.now() - startTime) / duration, 1);
    mesh.scale.lerpVectors(startScale, targetScale, progress);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      mesh.scale.copy(targetScale);
    }
  }
  requestAnimationFrame(animate);
}

function animateBuildingClick(mesh) {
  const origScale = mesh.userData.origScale || mesh.scale.clone();
  mesh.userData.origScale = origScale;
  const startScale = mesh.scale.clone();
  const targetScale = origScale.clone().multiplyScalar(1.18);
  let progress = 0;
  const duration = 150;
  const revertDuration = 120;
  const startTime = performance.now();
  function animateUp(now) {
    progress = Math.min((now - startTime) / duration, 1);
    mesh.scale.lerpVectors(startScale, targetScale, progress);
    if (progress < 1) {
      requestAnimationFrame(animateUp);
    } else {
      setTimeout(() => {
        const revertStart = performance.now();
        function animateDown(now2) {
          const revertProgress = Math.min((now2 - revertStart) / revertDuration, 1);
          mesh.scale.lerpVectors(targetScale, origScale, revertProgress);
          if (revertProgress < 1) {
            requestAnimationFrame(animateDown);
          } else {
            mesh.scale.copy(origScale);
          }
        }
        requestAnimationFrame(animateDown);
      }, 60);
    }
  }
  requestAnimationFrame(animateUp);
}
// --- Character hover animation ---
let characterHovered = false;

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(characterSprite);
  if (intersects.length > 0) {
    if (!characterHovered) {
      characterHovered = true;
      animateCharacterHover(true);
    }
  } else {
    if (characterHovered) {
      characterHovered = false;
      animateCharacterHover(false);
    }
  }
}

window.addEventListener('mousemove', onDocumentMouseMove);

function animateCharacterHover(hovering) {
  const startScale = characterSprite.scale.clone();
  const targetScale = hovering ? startScale.clone().multiplyScalar(1.18) : new THREE.Vector3(0.5, 1, 1);
  let progress = 0;
  const duration = 150;
  const startTime = performance.now();
  function animate() {
    progress = Math.min((performance.now() - startTime) / duration, 1);
    characterSprite.scale.lerpVectors(startScale, targetScale, progress);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      characterSprite.scale.copy(targetScale);
    }
  }
  requestAnimationFrame(animate);
}
// --- Raycaster for building and character click ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // Check buildings and character sprite
  const meshes = [...Object.values(buildingMeshes), characterSprite];
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    // Character click
    if (clicked === characterSprite) {
      // Animate, then redirect
      animateCharacterClick();
      setTimeout(() => {
        window.location.href = 'about.html';
      }, 200);
      return;
    }
    // Building click
    for (const [name, mesh] of Object.entries(buildingMeshes)) {
      if (mesh === clicked) {
        animateBuildingClick(mesh);
        // Show the correct window (do not hide others)
        if (name === 'Microsoft') {
          document.getElementById('microsoft-window').style.display = 'block';
        } else if (name === 'OLR') {
          document.getElementById('olr-window').style.display = 'block';
        } else if (name === 'ISEP') {
          document.getElementById('isep-window').style.display = 'block';
        } else if (name === 'Oracle') {
          document.getElementById('oracle-window').style.display = 'block';
        }
        break;
      }
    }
  }
}
// Character click animation (scale up then back)
function animateCharacterClick() {
  const startScale = characterSprite.scale.clone();
  const targetScale = startScale.clone().multiplyScalar(1.08);
  let progress = 0;
  const duration = 150; // ms
  const revertDuration = 120; // ms
  const startTime = performance.now();
  function animateUp(now) {
    progress = Math.min((now - startTime) / duration, 1);
    characterSprite.scale.lerpVectors(startScale, targetScale, progress);
    if (progress < 1) {
      requestAnimationFrame(animateUp);
    } else {
      setTimeout(() => {
        const revertStart = performance.now();
        function animateDown(now2) {
          const revertProgress = Math.min((now2 - revertStart) / revertDuration, 1);
          characterSprite.scale.lerpVectors(targetScale, startScale, revertProgress);
          if (revertProgress < 1) {
            requestAnimationFrame(animateDown);
          } else {
            characterSprite.scale.copy(startScale);
          }
        }
        requestAnimationFrame(animateDown);
      }, 60);
    }
  }
  requestAnimationFrame(animateUp);
}

window.addEventListener('click', onDocumentClick);
// Interactive CV Game in Three.js

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Orthographic camera for isometric view
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);
camera.position.set(10, 10, 10);
camera.rotation.x = -Math.PI / 6; // ~30 degrees down
camera.rotation.y = Math.PI / 4;  // 45 degrees
camera.lookAt(0, 1, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Character (sprite)
const character = new THREE.Group();

// Create sprite with default material
const characterMat = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true });
const characterSprite = new THREE.Sprite(characterMat);
characterSprite.scale.set(0.5, 1, 1);
// Ensure character always renders on top of everything
characterSprite.renderOrder = 1;
characterSprite.material.depthTest = false;
character.add(characterSprite);

// Load character image (replace with actual image URL)
const characterImg = new Image();
characterImg.crossOrigin = 'anonymous';
characterImg.src = 'character.png'; // Public domain Habbo-like character
characterImg.onload = () => {
  const characterTexture = pixelateImage(characterImg, 4);
  characterSprite.material.map = characterTexture;
  characterSprite.material.needsUpdate = true;
};

// Position character to match screenshot (in front of Oracle building)
character.position.set(4, 0.5, 0);
scene.add(character);

// World map
const tileSize = 1;
// Rectangle map dimensions
const mapWidth = 10;
const mapHeight = 12;

// Floor tiles
// Load the grass texture
const grassTexture = new THREE.TextureLoader().load('grass.png');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(1, 1); // Adjust tiling if needed


  for (let x = 0; x < mapWidth; x++) {
    for (let z = 0; z < mapHeight; z++) {
      const tileGeom = new THREE.PlaneGeometry(tileSize, tileSize);
      const tileMat = new THREE.MeshLambertMaterial({ map: grassTexture });
      const tile = new THREE.Mesh(tileGeom, tileMat);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x * tileSize - mapWidth / 2, 0, z * tileSize - mapHeight / 2);
      scene.add(tile);
    }
  }

// Paths (connect the 4 buildings)

// Load the stone texture for the path
const stoneTexture = new THREE.TextureLoader().load('stone.png');
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(1, 1); // Adjust tiling if needed

const pathPositions = [
  // Horizontal at z=2, x from left to right
  ...Array.from({length: mapWidth}, (_, i) => ({x: i - mapWidth/2, z: 2})),
  // Horizontal at z=-2, x from left to right
  ...Array.from({length: mapWidth}, (_, i) => ({x: i - mapWidth/2, z: -2})),
  // Vertical at x=2, z from top to bottom
  ...Array.from({length: mapHeight}, (_, i) => ({x: 2, z: i - mapHeight/2})),
  // Vertical at x=-2, z from top to bottom
  ...Array.from({length: mapHeight}, (_, i) => ({x: -2, z: i - mapHeight/2}))
];

pathPositions.forEach(pos => {
  const pathGeom = new THREE.PlaneGeometry(tileSize, tileSize);
  const pathMat = new THREE.MeshLambertMaterial({ map: stoneTexture });
  const path = new THREE.Mesh(pathGeom, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(pos.x * tileSize, 0.01, pos.z * tileSize);
  scene.add(path);
});

// Pixelize image function
function pixelateImage(img, pixelSize = 8) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  canvas.width = img.width / pixelSize;
  canvas.height = img.height / pixelSize;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = img.width;
  finalCanvas.height = img.height;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.imageSmoothingEnabled = false;
  finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);

  return new THREE.CanvasTexture(finalCanvas);
}

// Load and pixelize logos
const logoUrls = {
  ISEP: 'isep.png',
  Oracle: 'oracle.png',
  Microsoft: 'microsoft.png',
  OLR: 'olr.png'
};

const logoTextures = {};

Object.keys(logoUrls).forEach(name => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = logoUrls[name];
  img.onload = () => {
    logoTextures[name] = pixelateImage(img, 4);
    // Update building material if needed
  };
});

// Buildings
// Center buildings within the brown path lines
// Set static positions for buildings
const buildings = [
  { name: 'Oracle', pos: [4, 0, 4] },      // Top right
  { name: 'Microsoft', pos: [-2, 0, -2] },   // Bottom left
  { name: 'ISEP', pos: [4, 0, -2] },         // Bottom right
  { name: 'OLR', pos: [-2, 0, 4] }           // Top left
];

const buildingMeshes = {};

buildings.forEach(building => {
  // Use Sprite for image with natural aspect ratio
  const spriteMat = new THREE.SpriteMaterial({ transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  // Ensure buildings render below character
  sprite.renderOrder = 0;
  // Center buildings exactly on the path intersections
  const centerX = Math.round(building.pos[0] / tileSize) * tileSize;
  const centerZ = Math.round(building.pos[2] / tileSize) * tileSize;
  const raisedPos = [centerX, building.pos[1] + 2, centerZ];
  sprite.position.set(...raisedPos);
  scene.add(sprite);
  buildingMeshes[building.name] = sprite;
});

// Update materials when textures load
Object.keys(logoUrls).forEach(name => {
  const img = new Image();
  if (logoUrls[name].startsWith('http')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = logoUrls[name];
  img.onload = () => {
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    logoTextures[name] = texture;
    if (buildingMeshes[name]) {
      buildingMeshes[name].material.map = texture;
      buildingMeshes[name].material.needsUpdate = true;
      // Scale sprite to image aspect ratio, larger size
      const aspect = img.width / img.height;
      buildingMeshes[name].scale.set(4 * aspect, 4, 1);
    }
  };
});

// Keyboard input
// document.addEventListener('keydown', (e) => {
//   if (!e.repeat) {
//     const speed = tileSize;
//     let newX = character.position.x;
//     let newZ = character.position.z;
//     if (e.code === 'ArrowUp' || e.code === 'KeyW') {
//       newZ -= speed;
//     } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
//       newZ += speed;
//     } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
//       newX -= speed;
//     } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
//       newX += speed;
//     }
//     // Snap to grid
//     newX = Math.round(newX / tileSize) * tileSize;
//     newZ = Math.round(newZ / tileSize) * tileSize;
//     // Calculate map bounds
//     const minX = -mapWidth / 2;
//     const maxX = mapWidth / 2 - 1;
//     const minZ = -mapHeight / 2;
//     const maxZ = mapHeight / 2 - 1;
//     if (newX >= minX && newX <= maxX && newZ >= minZ && newZ <= maxZ) {
//       character.position.x = newX;
//       character.position.z = newZ;
//     }
//   }
// });

// Game loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = frustumSize * aspect / -2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
