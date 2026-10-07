import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { Matrix, inverse } from "https://cdn.jsdelivr.net/npm/ml-matrix@6.15.0/+esm";

const M1 = new Matrix([
  [1, 1],
  [0, 1]
]);

const M2 = new Matrix([
  [1, 0],
  [1, 1]
]);

// const M_inv_T = inverse(M).transpose();

// const M_T_inv = inverse(M.transpose());

const matrices = [
  M1.to2DArray(),
  M2.to2DArray()
];

// ==================================================
// Transformation Chain
// ==================================================
//
// Each matrix is applied to the CURRENT state.
//
// Original
//    ↓
// Matrix 1
//    ↓
// Matrix 2
//    ↓
// Matrix 3
//
// Mathematically:
//
// v₁ = A₁v₀
// v₂ = A₂v₁
// v₃ = A₃v₂
//
// Therefore the final transformation is:
//
// v₃ = A₃ A₂ A₁ v₀
//
// ==================================================

// const matrices = [
//   [
//     [3, 1],
//     [1, 1],
//   ],

//   [
//     [1, -1],
//     [-1, 3],
//   ],
// ];

const matrices_sample = [
  // =================================================
  // 1. Rotate 45°
  // =================================================

  [
    [Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4)],
    [Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)],
  ],

  // =================================================
  // 2. Stretch X by 2
  // =================================================

  [
    [2, 0],
    [0, 1],
  ],

  // =================================================
  // 3. Shear X
  // =================================================

  [
    [1, 0.75],
    [0, 1],
  ],

  // =================================================
  // 4. Rotate another 30°
  // =================================================

  [
    [Math.cos(Math.PI / 6), -Math.sin(Math.PI / 6)],
    [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)],
  ],
];

// ==================================================
// Scene
// ==================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffffff);

// ==================================================
// Camera
// ==================================================

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

camera.position.z = 10;

function updateCamera() {
  const aspect = window.innerWidth / window.innerHeight;

  const viewHeight = 12;

  const viewWidth = viewHeight * aspect;

  camera.left = -viewWidth / 2;

  camera.right = viewWidth / 2;

  camera.top = viewHeight / 2;

  camera.bottom = -viewHeight / 2;

  camera.updateProjectionMatrix();
}

updateCamera();

// ==================================================
// Renderer
// ==================================================

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#ffffff";

document.body.appendChild(renderer.domElement);

// ==================================================
// Grid
// ==================================================

const grid = new THREE.GridHelper(10, 20, 0xb0b0b0, 0xdcdcdc);

grid.rotation.x = Math.PI / 2;

grid.material.transparent = true;
grid.material.opacity = 0.8;

scene.add(grid);

// ==================================================
// Axes
// ==================================================

const axisMaterial = new THREE.LineBasicMaterial({
  color: 0x555555,
});

function makeLine(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return new THREE.Line(geometry, material);
}

scene.add(
  makeLine(
    [new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)],
    axisMaterial,
  ),
);

scene.add(
  makeLine(
    [new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)],
    axisMaterial,
  ),
);

// ==================================================
// Dots
// ==================================================

const dots = [];

const dotGeometry = new THREE.CircleGeometry(0.03, 16);

const dotMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222,
});

for (let x = -3; x <= 3.001; x += 0.5) {
  for (let y = -3; y <= 3.001; y += 0.5) {
    if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) {
      continue;
    }

    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

    const original = new THREE.Vector2(x, y);

    dot.position.set(x, y, 0);

    // ----------------------------------------------
    // Permanent original position
    // ----------------------------------------------

    dot.userData.original = original.clone();

    // ----------------------------------------------
    // Current position after completed operations
    // ----------------------------------------------

    dot.userData.current = original.clone();

    // ----------------------------------------------
    // Animation start/end
    // ----------------------------------------------

    dot.userData.animationStart = original.clone();

    dot.userData.animationTarget = original.clone();

    scene.add(dot);

    dots.push(dot);
  }
}

// ==================================================
// Basis vectors
// ==================================================

function createArrow(color, vector) {
  return new THREE.ArrowHelper(
    vector.clone().normalize(),
    new THREE.Vector3(0, 0, 0),
    vector.length(),
    color,
    0.22,
    0.11,
  );
}

const e1 = createArrow(0xe53935, new THREE.Vector3(1, 0, 0));
const e2 = createArrow(0x2e9d4d, new THREE.Vector3(0, 1, 0));

scene.add(e1);
scene.add(e2);

// ==================================================
// Basis vector state
// ==================================================

let currentE1 = new THREE.Vector2(1, 0);

let currentE2 = new THREE.Vector2(0, 1);

let animationE1Start = currentE1.clone();

let animationE1Target = currentE1.clone();

let animationE2Start = currentE2.clone();

let animationE2Target = currentE2.clone();

// ==================================================
// Labels
// ==================================================

function createLabel(text, color, fontSize = 3) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.font = `bold ${fontSize}rem Arial`;

  ctx.fillStyle = color;

  ctx.textBaseline = "middle";

  ctx.fillText(text, 20, 64);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(1.5, 0.375, 1);

  return sprite;
}

const e1Label = createLabel("e₁", "#e53935", 4);

const e2Label = createLabel("e₂", "#2e9d4d", 4);

e1Label.center.set(0, 0);
e2Label.center.set(0, 0);

e1Label.scale.set(3, 0.75, 1);
e2Label.scale.set(3, 0.75, 1);

scene.add(e1Label);
scene.add(e2Label);

updateLabelPositions(currentE1, currentE2);

// ==================================================
// Matrix label
// ==================================================

const matrixDisplay = document.createElement("div");
matrixDisplay.style.position = "absolute";
matrixDisplay.style.right = "1.25rem";
matrixDisplay.style.top = "1.25rem";
matrixDisplay.style.fontFamily = "Arial, sans-serif";
matrixDisplay.style.fontSize = "1.5rem";
matrixDisplay.style.fontWeight = "bold";
matrixDisplay.style.color = "#222";
matrixDisplay.style.background = "rgba(255, 255, 255, 0.85)";
matrixDisplay.style.padding = "0.75rem 1rem";
matrixDisplay.style.borderRadius = "0.375rem";
document.body.appendChild(matrixDisplay);

function updateLabelPositions(e1Vector, e2Vector) {
  const offset = 0.25;

  // e1: offset slightly perpendicular to the vector
  const e1Length = e1Vector.length();

  if (e1Length > 0.0001) {
    const e1Normal = new THREE.Vector2(-e1Vector.y, e1Vector.x).normalize();

    e1Label.position.set(
      e1Vector.x + e1Normal.x * offset,
      e1Vector.y + e1Normal.y * offset,
      0,
    );
  }

  // e2
  const e2Length = e2Vector.length();

  if (e2Length > 0.0001) {
    const e2Normal = new THREE.Vector2(-e2Vector.y, e2Vector.x).normalize();

    e2Label.position.set(
      e2Vector.x + e2Normal.x * offset,
      e2Vector.y + e2Normal.y * offset,
      0,
    );
  }
}

// ==================================================
// Matrix formatting
// ==================================================

function formatMatrix(A) {
  function n(value) {
    const rounded = Number(value.toFixed(2));

    return rounded;
  }

  return (
    "A = [ " +
    n(A[0][0]) +
    "  " +
    n(A[0][1]) +
    " ; " +
    n(A[1][0]) +
    "  " +
    n(A[1][1]) +
    " ]"
  );
}

// ==================================================
// Apply matrix to vector
// ==================================================

function applyMatrix(matrix, vector) {
  return new THREE.Vector2(
    matrix[0][0] * vector.x + matrix[0][1] * vector.y,

    matrix[1][0] * vector.x + matrix[1][1] * vector.y,
  );
}

// ==================================================
// Prepare animation for a matrix
// ==================================================

function prepareStep(matrix) {
  // ----------------------------------------------
  // Points
  // ----------------------------------------------

  for (const dot of dots) {
    const start = dot.userData.current.clone();

    const target = applyMatrix(matrix, start);

    dot.userData.animationStart = start;

    dot.userData.animationTarget = target;
  }

  // ----------------------------------------------
  // Basis e1
  // ----------------------------------------------

  animationE1Start = currentE1.clone();

  animationE1Target = applyMatrix(matrix, currentE1);

  // ----------------------------------------------
  // Basis e2
  // ----------------------------------------------

  animationE2Start = currentE2.clone();

  animationE2Target = applyMatrix(matrix, currentE2);
}

// ==================================================
// Commit completed transformation
// ==================================================

function commitStep() {
  for (const dot of dots) {
    dot.userData.current = dot.userData.animationTarget.clone();

    dot.position.set(dot.userData.current.x, dot.userData.current.y, 0);
  }

  currentE1 = animationE1Target.clone();

  currentE2 = animationE2Target.clone();

  updateArrow(e1, currentE1);

  updateArrow(e2, currentE2);

  updateLabelPositions(currentE1, currentE2);
}

// ==================================================
// Arrow update
// ==================================================

function updateArrow(arrow, vector) {
  const length = vector.length();

  arrow.position.set(0, 0, 0);

  arrow.visible = length > 0.0001;

  if (!arrow.visible) {
    return;
  }

  arrow.setDirection(new THREE.Vector3(vector.x, vector.y, 0).normalize());

  arrow.setLength(
    length,

    Math.min(0.22, length * 0.25),

    Math.min(0.11, length * 0.15),
  );
}

// ==================================================
// Matrix label texture
// ==================================================

function setMatrixLabel(matrix) {
  function n(value) {
    return Number(value.toFixed(2));
  }

  matrixDisplay.innerHTML = `
    <span>A =</span>

    <span style="
      display: inline-flex;
      align-items: center;
      margin-left: 0.25rem;
    ">

      <span style="
        font-size: 2.5rem;
        font-weight: normal;
        line-height: 0.8;
      ">[</span>

      <span style="
        display: grid;
        grid-template-columns: auto auto;
        gap: 0.1rem 0.75rem;
        margin: 0 0.3rem;
        text-align: right;
      ">
        <span>${n(matrix[0][0])}</span>
        <span>${n(matrix[0][1])}</span>
        <span>${n(matrix[1][0])}</span>
        <span>${n(matrix[1][1])}</span>
      </span>

      <span style="
        font-size: 2.5rem;
        font-weight: normal;
        line-height: 0.8;
      ">]</span>

    </span>
  `;
}

// ==================================================
// Animation settings
// ==================================================

const PAUSE_BEFORE = 500;

const TRANSFORM_TIME = 2500;

const PAUSE_AFTER = 500;

// ==================================================
// Animation state
// ==================================================
//
// currentStep means:
//
// 0 = first matrix is next
// 1 = second matrix is next
// 2 = third matrix is next
//
// IMPORTANT:
// We do NOT increment this automatically when an
// animation finishes. That makes Play / Next behave
// predictably.
//

let currentStep = 0;

let animationStart = null;

let playing = false;

let playToEnd = false;

// ==================================================
// Play current step
// ==================================================

function playCurrentStep() {
  if (currentStep < 0 || currentStep >= matrices.length) {
    return;
  }

  const matrix = matrices[currentStep];

  prepareStep(matrix);

  setMatrixLabel(matrix);

  animationStart = performance.now();

  playing = true;
}

// ==================================================
// Finish current step
// ==================================================

function finishCurrentStep() {
  commitStep();

  playing = false;

  animationStart = null;

  currentStep++;
}

// ==================================================
// Replay
// ==================================================

function reset() {
  playToEnd = false;

  // ----------------------------------------------
  // Reset points
  // ----------------------------------------------

  for (const dot of dots) {
    const original = dot.userData.original;

    dot.userData.current = original.clone();

    dot.position.set(original.x, original.y, 0);
  }

  // ----------------------------------------------
  // Reset basis vectors
  // ----------------------------------------------

  currentE1 = new THREE.Vector2(1, 0);

  currentE2 = new THREE.Vector2(0, 1);

  updateArrow(e1, currentE1);

  updateArrow(e2, currentE2);

  // ----------------------------------------------
  // Reset labels
  // ----------------------------------------------

  updateLabelPositions(currentE1, currentE2);

  // ----------------------------------------------
  // Reset step
  // ----------------------------------------------

  currentStep = 0;

  playing = false;

  animationStart = null;

  setMatrixLabel(matrices[0]);
}

// ==================================================
// Play button
// ==================================================

const playButton = document.createElement("button");

playButton.textContent = "▶";

playButton.style.padding = "0.5rem 1rem";

playButton.style.fontSize = "1rem";

playButton.style.background = "#ffffff";

playButton.style.border = "1px solid #999";

playButton.style.borderRadius = "6px";

playButton.style.cursor = "pointer";

playButton.addEventListener("click", () => {
  if (playing) {
    return;
  }

  if (currentStep >= matrices.length) {
    reset();
  }

  playToEnd = true;

  playCurrentStep();
});

// ==================================================
// Next button
// ==================================================

const nextButton = document.createElement("button");

nextButton.textContent = "⏭";

nextButton.style.padding = "0.5rem 1rem";

nextButton.style.fontSize = "1rem";

nextButton.style.background = "#ffffff";

nextButton.style.border = "1px solid #999";

nextButton.style.borderRadius = "6px";

nextButton.style.cursor = "pointer";

nextButton.addEventListener("click", () => {
  // If currently animating, finish this
  // operation first.
  if (playing) {
    finishCurrentStep();
  }

  // Don't go beyond the chain.
  if (currentStep >= matrices.length) {
    return;
  }

  playCurrentStep();
});

// ==================================================
// Replay button
// ==================================================

const resetButton = document.createElement("button");

resetButton.textContent = "↻";

resetButton.style.padding = "0.5rem 1rem";

resetButton.style.fontSize = "1rem";

resetButton.style.background = "#ffffff";

resetButton.style.border = "1px solid #999";

resetButton.style.borderRadius = "6px";

resetButton.style.cursor = "pointer";

const controls = document.createElement("div");

controls.style.position = "absolute";
controls.style.left = "1.25rem";
controls.style.top = "1.25rem";
controls.style.display = "flex";
controls.style.flexDirection = "column";
controls.style.alignItems = "flex-start";
controls.style.gap = "1rem";

document.body.appendChild(controls);

const buttonRow = document.createElement("div");

buttonRow.style.display = "flex";
buttonRow.style.gap = "2rem";

controls.appendChild(buttonRow);

buttonRow.appendChild(nextButton);
buttonRow.appendChild(playButton);
buttonRow.appendChild(resetButton);

resetButton.addEventListener("click", () => {
  reset();
});

// ==================================================
// Step indicator
// ==================================================

const stepLabel = document.createElement("div");

stepLabel.style.fontFamily = "Arial, sans-serif";

stepLabel.style.fontSize = "1rem";

stepLabel.style.color = "#333";

controls.appendChild(stepLabel);

// ==================================================
// Animation
// ==================================================

function animate(time) {
  requestAnimationFrame(animate);

  // ----------------------------------------------
  // Nothing playing
  // ----------------------------------------------

  if (!playing) {
    updateStepLabel();

    renderer.render(scene, camera);

    return;
  }

  const elapsed = time - animationStart;

  let t = 0;

  // ----------------------------------------------
  // Initial pause
  // ----------------------------------------------

  if (elapsed < PAUSE_BEFORE) {
    t = 0;
  }

  // ----------------------------------------------
  // Transform
  // ----------------------------------------------
  else if (elapsed < PAUSE_BEFORE + TRANSFORM_TIME) {
    const transformElapsed = elapsed - PAUSE_BEFORE;

    const raw = transformElapsed / TRANSFORM_TIME;

    // Smoothstep

    t = raw * raw * (3 - 2 * raw);
  }

  // ----------------------------------------------
  // Finished
  // ----------------------------------------------
  else {
    t = 1;

    // Update final positions.

    for (const dot of dots) {
      const target = dot.userData.animationTarget;

      dot.position.set(target.x, target.y, 0);
    }

    updateArrow(e1, animationE1Target);

    updateArrow(e2, animationE2Target);

    updateLabelPositions(animationE1Target, animationE2Target);

    // Keep the completed state,
    // but DON'T advance currentStep.

    if (elapsed > PAUSE_BEFORE + TRANSFORM_TIME + PAUSE_AFTER) {
      // Commit this transformation.
      commitStep();

      currentStep++;

      if (playToEnd && currentStep < matrices.length) {
        // Immediately prepare the next transformation.
        // No intermediate "playing = false" frame.
        playCurrentStep();

        updateStepLabel();

        renderer.render(scene, camera);

        // IMPORTANT:
        //
        // Do not continue into the interpolation
        // code below. Otherwise t = 1 from the old
        // animation gets applied to the new one.
        return;
      }

      // --------------------------------------------
      // Chain finished
      // --------------------------------------------

      playing = false;

      animationStart = null;

      playToEnd = false;
    }
  }

  // =================================================
  // Interpolate points
  // =================================================

  if (playing) {
    for (const dot of dots) {
      const start = dot.userData.animationStart;

      const target = dot.userData.animationTarget;

      const x = THREE.MathUtils.lerp(start.x, target.x, t);

      const y = THREE.MathUtils.lerp(start.y, target.y, t);

      dot.position.set(x, y, 0);
    }

    // =================================================
    // Interpolate basis vectors
    // =================================================

    const e1Current = new THREE.Vector2(
      THREE.MathUtils.lerp(animationE1Start.x, animationE1Target.x, t),

      THREE.MathUtils.lerp(animationE1Start.y, animationE1Target.y, t),
    );

    const e2Current = new THREE.Vector2(
      THREE.MathUtils.lerp(animationE2Start.x, animationE2Target.x, t),

      THREE.MathUtils.lerp(animationE2Start.y, animationE2Target.y, t),
    );

    updateArrow(e1, e1Current);

    updateArrow(e2, e2Current);

    updateLabelPositions(e1Current, e2Current);
  }

  updateStepLabel();

  renderer.render(scene, camera);
}

// ==================================================
// Step label
// ==================================================

function updateStepLabel() {
  if (matrices.length === 0) {
    stepLabel.textContent = "No transformations";

    return;
  }

  const displayedStep = Math.min(currentStep + 1, matrices.length);

  stepLabel.textContent = "Step " + displayedStep + " / " + matrices.length;
}

// ==================================================
// Resize
// ==================================================

window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;

  const size = 6;

  camera.left = -size * aspect;

  camera.right = size * aspect;

  camera.top = size;

  camera.bottom = -size;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================================================
// Initial state
// ==================================================

setMatrixLabel(matrices[0]);

updateArrow(e1, currentE1);

updateArrow(e2, currentE2);

updateStepLabel();

// ==================================================
// Start
// ==================================================

animate(performance.now());
