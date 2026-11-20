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

// ==================================================
// State 1: Original matrix list
// ==================================================
//
// This is the list configured by the user. It never
// stores transformed results; every frame of the
// animation is computed from the original points and
// this list.
//

const matrices = [
  M1.to2DArray(),
  M2.to2DArray()
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
// Unit circle
// ==================================================
//
// The unit circle is transformed by the same matrix
// chain as the dots. A linear transformation maps it
// to an ellipse, which makes rotation and stretching
// easier to see than the point lattice alone.
//

const UNIT_CIRCLE_SEGMENTS = 180;

const unitCircleOriginal = [];

for (let i = 0; i < UNIT_CIRCLE_SEGMENTS; i++) {
  const angle = (i / UNIT_CIRCLE_SEGMENTS) * Math.PI * 2;

  unitCircleOriginal.push(
    new THREE.Vector2(Math.cos(angle), Math.sin(angle)),
  );
}

const unitCircle = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(
    unitCircleOriginal.map((point) => new THREE.Vector3(point.x, point.y, 0)),
  ),
  new THREE.LineBasicMaterial({
    color: 0x1565c0,
    transparent: true,
    opacity: 0.8,
  }),
);

unitCircle.position.z = 0.01;

unitCircle.renderOrder = 1;

unitCircle.frustumCulled = false;

scene.add(unitCircle);

let unitCircleCurrent = unitCircleOriginal.map((point) => point.clone());

let unitCircleAnimationStart = unitCircleOriginal.map((point) =>
  point.clone(),
);

let unitCircleAnimationTarget = unitCircleOriginal.map((point) =>
  point.clone(),
);

function updateUnitCircleGeometry(points) {
  const positions = unitCircle.geometry.attributes.position;

  for (let i = 0; i < points.length; i++) {
    positions.setXY(i, points[i].x, points[i].y);
  }

  positions.needsUpdate = true;
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
// State 3: Visualization state
// ==================================================
//
// These values describe what is currently drawn on
// screen. They are only updated when an animation is
// committed or when the visualization is reset.
//

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
// Eigenvector and singular vector overlays
// ==================================================
//
// These vectors describe the whole matrix chain. They
// are drawn in the same plane as the grid and are only
// shown when the matching checkbox is enabled.
//

const OVERLAY_VECTOR_LENGTH = 2;

const VECTOR_EPSILON = 1e-9;

const EIGENVECTOR_COLORS = ["#e65100", "#f9a825"];
const RIGHT_SINGULAR_COLORS = ["#00838f", "#26a69a"];
const LEFT_SINGULAR_COLORS = ["#6a1b9a", "#ab47bc"];

let showEigenvectors = false;

let showSingularVectors = false;

// Display vectors for every step of the chain.
// The moving arrows are carried from their
// whole-chain vectors by applying each matrix in
// turn, so they both rotate and scale.

let eigenvectorSteps = null;

let rightSingularSteps = null;

let leftSingularReferences = null;

let overlayProgress = 1;

const eigenvectorArrows = [
  createArrow(0xe65100, new THREE.Vector3(1, 0, 0)),
  createArrow(0xf9a825, new THREE.Vector3(0, 1, 0)),
];

const rightSingularArrows = [
  createArrow(0x00838f, new THREE.Vector3(1, 0, 0)),
  createArrow(0x26a69a, new THREE.Vector3(0, 1, 0)),
];

const leftSingularArrows = [
  createArrow(0x6a1b9a, new THREE.Vector3(1, 0, 0)),
  createArrow(0xab47bc, new THREE.Vector3(0, 1, 0)),
];

for (const arrow of leftSingularArrows) {
  // Reference directions are drawn faintly so they
  // read as output-space guides rather than moving
  // input vectors.

  arrow.line.material.transparent = true;

  arrow.line.material.opacity = 0.6;

  arrow.cone.material.transparent = true;

  arrow.cone.material.opacity = 0.6;
}

function createOverlayLabel(text, color) {
  const label = createLabel(text, color, 4);

  label.center.set(0.5, 0.5);

  label.scale.set(2.5, 0.625, 1);

  label.visible = false;

  scene.add(label);

  return label;
}

const eigenvectorLabels = [
  createOverlayLabel("ev₁", EIGENVECTOR_COLORS[0]),
  createOverlayLabel("ev₂", EIGENVECTOR_COLORS[1]),
];

const rightSingularLabels = [
  createOverlayLabel("v₁", RIGHT_SINGULAR_COLORS[0]),
  createOverlayLabel("v₂", RIGHT_SINGULAR_COLORS[1]),
];

const leftSingularLabels = [
  createOverlayLabel("u₁", LEFT_SINGULAR_COLORS[0]),
  createOverlayLabel("u₂", LEFT_SINGULAR_COLORS[1]),
];

for (const label of leftSingularLabels) {
  label.material.opacity = 0.6;
}

for (const arrow of [
  ...eigenvectorArrows,
  ...rightSingularArrows,
  ...leftSingularArrows,
]) {
  arrow.visible = false;

  scene.add(arrow);
}

function hideOverlayGroup(arrows, labels) {
  for (const arrow of arrows) {
    arrow.visible = false;
  }

  for (const label of labels) {
    label.visible = false;
  }
}

function updateOverlayArrow(arrow, label, vector) {
  const length = vector.length();

  if (length < VECTOR_EPSILON) {
    arrow.visible = false;

    label.visible = false;

    return;
  }

  const unit = vector.clone().divideScalar(length);

  arrow.visible = true;

  arrow.position.set(0, 0, 0.05);

  arrow.setDirection(new THREE.Vector3(unit.x, unit.y, 0));

  arrow.setLength(
    length,

    Math.min(0.22, length * 0.25),

    Math.min(0.11, length * 0.15),
  );

  label.visible = true;

  label.position.set(
    vector.x + unit.x * 0.3,

    vector.y + unit.y * 0.3,

    0.05,
  );
}

function computeEigenvectors(matrix) {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  const trace = a + d;

  const determinant = a * d - b * c;

  const discriminant = trace * trace - 4 * determinant;

  // ----------------------------------------------
  // Complex eigenvalues: no real eigenvectors
  // ----------------------------------------------

  if (discriminant < -VECTOR_EPSILON) {
    return null;
  }

  const root = Math.sqrt(Math.max(0, discriminant));

  const lambda1 = (trace + root) / 2;

  const lambda2 = (trace - root) / 2;

  function eigenvectorFor(lambda) {
    if (Math.abs(b) > VECTOR_EPSILON || Math.abs(c) > VECTOR_EPSILON) {
      if (Math.abs(b) >= Math.abs(c)) {
        return new THREE.Vector2(b, lambda - a).normalize();
      }

      return new THREE.Vector2(lambda - d, c).normalize();
    }

    if (Math.abs(lambda - a) <= Math.abs(lambda - d)) {
      return new THREE.Vector2(1, 0);
    }

    return new THREE.Vector2(0, 1);
  }

  const eigenvectors = [eigenvectorFor(lambda1)];

  if (Math.abs(lambda1 - lambda2) > VECTOR_EPSILON) {
    eigenvectors.push(eigenvectorFor(lambda2));
  } else if (
    Math.abs(b) < VECTOR_EPSILON &&
    Math.abs(c) < VECTOR_EPSILON
  ) {
    // A scalar matrix has every direction as an eigenvector.
    eigenvectors.push(new THREE.Vector2(0, 1));
  } else {
    // Defective matrix: only one independent eigenvector.
    eigenvectors.push(null);
  }

  return eigenvectors;
}

function computeSingularVectors(matrix) {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];

  // ----------------------------------------------
  // Eigen-decomposition of the symmetric matrix
  // MᵀM gives the right singular vectors.
  // ----------------------------------------------

  const p00 = a * a + c * c;

  const p01 = a * b + c * d;

  const p11 = b * b + d * d;

  const theta = 0.5 * Math.atan2(2 * p01, p00 - p11);

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  const mean = (p00 + p11) / 2;

  const spread = Math.hypot((p00 - p11) / 2, p01);

  const sigma1 = Math.sqrt(Math.max(0, mean + spread));

  const sigma2 = Math.sqrt(Math.max(0, mean - spread));

  const v1 = new THREE.Vector2(cos, sin);

  const v2 = new THREE.Vector2(-sin, cos);

  // ----------------------------------------------
  // Left singular vectors: uᵢ = Mvᵢ / σᵢ
  // ----------------------------------------------

  let u1;

  let u2;

  if (sigma1 > VECTOR_EPSILON) {
    u1 = applyMatrix(matrix, v1).multiplyScalar(1 / sigma1);
  } else {
    u1 = new THREE.Vector2(1, 0);
  }

  if (sigma2 > VECTOR_EPSILON) {
    u2 = applyMatrix(matrix, v2).multiplyScalar(1 / sigma2);
  } else {
    u2 = new THREE.Vector2(-u1.y, u1.x);
  }

  return { u1, u2, v1, v2, sigma1, sigma2 };
}

function carryVector(matrix, vector) {
  if (!vector) {
    return null;
  }

  return applyMatrix(matrix, vector);
}

function prepareOverlayData() {
  const product = computeChainProduct();

  const eigenvectors = computeEigenvectors(product);

  const singular = computeSingularVectors(product);

  // ----------------------------------------------
  // Whole-chain vectors at step 0
  // ----------------------------------------------

  eigenvectorSteps = eigenvectors
    ? [
        eigenvectors.map((vector) =>
          vector ? vector.clone().multiplyScalar(OVERLAY_VECTOR_LENGTH) : null,
        ),
      ]
    : null;

  rightSingularSteps = [
    [
      singular.v1.clone().multiplyScalar(OVERLAY_VECTOR_LENGTH),

      singular.v2.clone().multiplyScalar(OVERLAY_VECTOR_LENGTH),
    ],
  ];

  // Left singular vectors are fixed reference
  // directions in the output space. Their lengths
  // reflect the final singular scaling.

  leftSingularReferences = [
    singular.u1
      .clone()
      .multiplyScalar(OVERLAY_VECTOR_LENGTH * singular.sigma1),

    singular.u2
      .clone()
      .multiplyScalar(OVERLAY_VECTOR_LENGTH * singular.sigma2),
  ];

  // ----------------------------------------------
  // Carry the moving vectors through the chain
  // ----------------------------------------------

  for (let i = 0; i < matrices.length; i++) {
    if (eigenvectorSteps) {
      eigenvectorSteps.push(
        eigenvectorSteps[i].map((vector) => carryVector(matrices[i], vector)),
      );
    }

    rightSingularSteps.push(
      rightSingularSteps[i].map((vector) => carryVector(matrices[i], vector)),
    );
  }
}

function lerpVector(from, to, t) {
  const fromX = from ? from.x : 0;

  const fromY = from ? from.y : 0;

  const toX = to ? to.x : 0;

  const toY = to ? to.y : 0;

  return new THREE.Vector2(
    THREE.MathUtils.lerp(fromX, toX, t),

    THREE.MathUtils.lerp(fromY, toY, t),
  );
}

function overlayStepIndex(step) {
  return Math.max(0, Math.min(step, matrices.length));
}

function updateEigenvectorOverlay(stepFrom, stepTo, t) {
  if (!showEigenvectors || !eigenvectorSteps) {
    hideOverlayGroup(eigenvectorArrows, eigenvectorLabels);

    return;
  }

  const from = eigenvectorSteps[overlayStepIndex(stepFrom)];

  const to = eigenvectorSteps[overlayStepIndex(stepTo)];

  for (let i = 0; i < 2; i++) {
    const vector = lerpVector(from[i], to[i], t);

    updateOverlayArrow(eigenvectorArrows[i], eigenvectorLabels[i], vector);
  }
}

function updateSingularVectorOverlay(stepFrom, stepTo, t) {
  if (
    !showSingularVectors ||
    !rightSingularSteps ||
    !leftSingularReferences
  ) {
    hideOverlayGroup(rightSingularArrows, rightSingularLabels);

    hideOverlayGroup(leftSingularArrows, leftSingularLabels);

    return;
  }

  const from = rightSingularSteps[overlayStepIndex(stepFrom)];

  const to = rightSingularSteps[overlayStepIndex(stepTo)];

  for (let i = 0; i < 2; i++) {
    const vector = lerpVector(from[i], to[i], t);

    updateOverlayArrow(rightSingularArrows[i], rightSingularLabels[i], vector);

    // Left singular vectors are fixed reference
    // directions in the output space.

    updateOverlayArrow(
      leftSingularArrows[i],
      leftSingularLabels[i],
      leftSingularReferences[i].clone(),
    );
  }
}

function updateOverlayVectors(t) {
  const stepFrom = currentStep;

  const stepTo = playing ? targetStep : currentStep;

  overlayProgress = playing ? t : 1;

  updateEigenvectorOverlay(stepFrom, stepTo, overlayProgress);

  updateSingularVectorOverlay(stepFrom, stepTo, overlayProgress);
}

function refreshOverlayVectors() {
  prepareOverlayData();

  updateOverlayVectors(playing ? overlayProgress : 1);
}

// ==================================================
// Matrix labels
// ==================================================

const infoPanel = document.createElement("div");

infoPanel.style.position = "absolute";
infoPanel.style.right = "1.25rem";
infoPanel.style.top = "1.25rem";
infoPanel.style.display = "flex";
infoPanel.style.flexDirection = "column";
infoPanel.style.alignItems = "flex-end";
infoPanel.style.gap = "0.75rem";
infoPanel.style.pointerEvents = "none";

document.body.appendChild(infoPanel);

const matrixDisplay = document.createElement("div");
matrixDisplay.style.fontFamily = "Arial, sans-serif";
matrixDisplay.style.fontSize = "1.5rem";
matrixDisplay.style.fontWeight = "bold";
matrixDisplay.style.color = "#222";
matrixDisplay.style.background = "rgba(255, 255, 255, 0.85)";
matrixDisplay.style.padding = "0.75rem 1rem";
matrixDisplay.style.borderRadius = "0.375rem";
matrixDisplay.style.pointerEvents = "none";
infoPanel.appendChild(matrixDisplay);

const productDisplay = document.createElement("div");
productDisplay.style.fontFamily = "Arial, sans-serif";
productDisplay.style.fontSize = "1.5rem";
productDisplay.style.fontWeight = "bold";
productDisplay.style.color = "#222";
productDisplay.style.background = "rgba(255, 255, 255, 0.85)";
productDisplay.style.padding = "0.75rem 1rem";
productDisplay.style.borderRadius = "0.375rem";
productDisplay.style.pointerEvents = "none";
infoPanel.appendChild(productDisplay);

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
// Apply matrix to vector
// ==================================================

function applyMatrix(matrix, vector) {
  return new THREE.Vector2(
    matrix[0][0] * vector.x + matrix[0][1] * vector.y,

    matrix[1][0] * vector.x + matrix[1][1] * vector.y,
  );
}

// ==================================================
// Matrix multiplication
// ==================================================

function multiplyMatrices(a, b) {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ];
}

function computeChainProduct() {
  let product = [
    [1, 0],
    [0, 1],
  ];

  for (let i = 0; i < matrices.length; i++) {
    product = multiplyMatrices(matrices[i], product);
  }

  return product;
}

// ==================================================
// Compute the state after a number of steps
// ==================================================
//
// The state is always computed from the original
// points and the current matrix list. This avoids
// accidentally accumulating transformations.
//

function computeStateAtStep(stepCount) {
  const points = dots.map((dot) => {
    let point = dot.userData.original.clone();

    for (let i = 0; i < stepCount; i++) {
      point = applyMatrix(matrices[i], point);
    }

    return point;
  });

  let basisE1 = new THREE.Vector2(1, 0);

  let basisE2 = new THREE.Vector2(0, 1);

  for (let i = 0; i < stepCount; i++) {
    basisE1 = applyMatrix(matrices[i], basisE1);

    basisE2 = applyMatrix(matrices[i], basisE2);
  }

  const circlePoints = unitCircleOriginal.map((originalPoint) => {
    let point = originalPoint.clone();

    for (let i = 0; i < stepCount; i++) {
      point = applyMatrix(matrices[i], point);
    }

    return point;
  });

  return {
    points,
    circlePoints,
    e1: basisE1,
    e2: basisE2,
  };
}

// ==================================================
// Prepare animation for a target step
// ==================================================

function prepareStep(targetStepIndex) {
  const targetState = computeStateAtStep(targetStepIndex);

  // ----------------------------------------------
  // Points
  // ----------------------------------------------

  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i];

    dot.userData.animationStart = dot.userData.current.clone();

    dot.userData.animationTarget = targetState.points[i].clone();
  }

  // ----------------------------------------------
  // Basis e1
  // ----------------------------------------------

  animationE1Start = currentE1.clone();

  animationE1Target = targetState.e1.clone();

  // ----------------------------------------------
  // Basis e2
  // ----------------------------------------------

  animationE2Start = currentE2.clone();

  animationE2Target = targetState.e2.clone();

  // ----------------------------------------------
  // Unit circle
  // ----------------------------------------------

  unitCircleAnimationStart = unitCircleCurrent.map((point) => point.clone());

  unitCircleAnimationTarget = targetState.circlePoints.map((point) =>
    point.clone(),
  );
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

  unitCircleCurrent = unitCircleAnimationTarget.map((point) => point.clone());

  updateUnitCircleGeometry(unitCircleCurrent);

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

function formatMatrixValue(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return String(Number(value.toFixed(4)));
}

function matrixMarkup(matrix) {
  return `
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
        <span>${formatMatrixValue(matrix[0][0])}</span>
        <span>${formatMatrixValue(matrix[0][1])}</span>
        <span>${formatMatrixValue(matrix[1][0])}</span>
        <span>${formatMatrixValue(matrix[1][1])}</span>
      </span>

      <span style="
        font-size: 2.5rem;
        font-weight: normal;
        line-height: 0.8;
      ">]</span>

    </span>
  `;
}

function setMatrixLabel(index) {
  if (index === null || index === undefined || !matrices[index]) {
    matrixDisplay.innerHTML = `
      <span style="
        font-size: 1rem;
        font-weight: normal;
        color: #666;
      ">No transformations</span>
    `;

    return;
  }

  matrixDisplay.innerHTML = `
    <span>A<sub>${index + 1}</sub> =</span>

    ${matrixMarkup(matrices[index])}
  `;
}

function chainProductLabel() {
  if (matrices.length === 0) {
    return "I";
  }

  if (matrices.length <= 4) {
    const factors = [];

    for (let i = matrices.length; i >= 1; i--) {
      factors.push(`A<sub>${i}</sub>`);
    }

    return factors.join("");
  }

  return `A<sub>${matrices.length}</sub>⋯A<sub>2</sub>A<sub>1</sub>`;
}

function refreshProductLabel() {
  productDisplay.innerHTML = `
    <span>${chainProductLabel()} =</span>

    ${matrixMarkup(computeChainProduct())}
  `;
}

function refreshMatrixLabel() {
  if (matrices.length === 0) {
    setMatrixLabel(null);

    return;
  }

  const index = Math.min(currentStep, matrices.length - 1);

  setMatrixLabel(index);
}

// ==================================================
// Matrix editing helpers
// ==================================================

function cleanNumber(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const rounded = Number(value.toFixed(10));

  return Math.abs(rounded) < 1e-10 ? 0 : rounded;
}

function formatInputValue(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return String(Number(value.toFixed(6)));
}

// ==================================================
// Animation settings
// ==================================================

const PAUSE_BEFORE = 500;

const TRANSFORM_TIME = 2500;

const PAUSE_AFTER = 500;

// ==================================================
// State 2: Transformation progress
// ==================================================
//
// currentStep is the number of completed matrices.
//
// 0 = original state, first matrix is next
// 1 = one matrix completed, second matrix is next
// 2 = two matrices completed, etc.
//

let currentStep = 0;

let animationStart = null;

let playing = false;

let playToEnd = false;

let stepDirection = 0;

let targetStep = 0;

// ==================================================
// Play a transition
// ==================================================

function startTransition(toStep) {
  if (toStep < 0 || toStep > matrices.length) {
    return;
  }

  if (toStep === currentStep) {
    return;
  }

  stepDirection = toStep > currentStep ? 1 : -1;

  targetStep = toStep;

  prepareStep(toStep);

  // For a forward step, show the matrix being applied.
  // For a backward step, show the matrix being undone.

  const activeIndex = stepDirection > 0 ? toStep - 1 : toStep;

  setMatrixLabel(activeIndex);

  animationStart = performance.now();

  playing = true;

  updateStepLabel();
}

// ==================================================
// Finish current step immediately
// ==================================================

function finishCurrentStep() {
  if (!playing) {
    return;
  }

  commitStep();

  currentStep = targetStep;

  playing = false;

  animationStart = null;

  stepDirection = 0;

  refreshMatrixLabel();

  updateStepLabel();
}

// ==================================================
// Reset visualization
// ==================================================

function reset() {
  playToEnd = false;

  playing = false;

  animationStart = null;

  stepDirection = 0;

  targetStep = 0;

  // ----------------------------------------------
  // Reset points
  // ----------------------------------------------

  for (const dot of dots) {
    const original = dot.userData.original;

    dot.userData.current = original.clone();

    dot.userData.animationStart = original.clone();

    dot.userData.animationTarget = original.clone();

    dot.position.set(original.x, original.y, 0);
  }

  // ----------------------------------------------
  // Reset basis vectors
  // ----------------------------------------------

  currentE1 = new THREE.Vector2(1, 0);

  currentE2 = new THREE.Vector2(0, 1);

  animationE1Start = currentE1.clone();

  animationE1Target = currentE1.clone();

  animationE2Start = currentE2.clone();

  animationE2Target = currentE2.clone();

  // ----------------------------------------------
  // Reset unit circle
  // ----------------------------------------------

  unitCircleCurrent = unitCircleOriginal.map((point) => point.clone());

  unitCircleAnimationStart = unitCircleOriginal.map((point) =>
    point.clone(),
  );

  unitCircleAnimationTarget = unitCircleOriginal.map((point) =>
    point.clone(),
  );

  updateUnitCircleGeometry(unitCircleCurrent);

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

  refreshMatrixLabel();

  updateStepLabel();
}

// ==================================================
// Matrix chain changed
// ==================================================
//
// Any edit, reorder, add, delete, transpose or
// inverse resets the visualization. This is the
// "automatic reset" required by the editor.
//

function handleChainChange({ rebuildEditor = true } = {}) {
  clearMessage();

  if (rebuildEditor) {
    renderMatrixEditor();
  }

  // Any change to the chain invalidates the vector overlays.

  clearVectorOverlays();

  refreshProductLabel();

  reset();
}

// ==================================================
// Play / Next / Previous / Reset actions
// ==================================================

function playAll() {
  if (playing || matrices.length === 0) {
    return;
  }

  if (currentStep >= matrices.length) {
    reset();
  }

  playToEnd = true;

  startTransition(currentStep + 1);
}

function nextStep() {
  playToEnd = false;

  if (playing) {
    finishCurrentStep();
  }

  if (currentStep >= matrices.length) {
    return;
  }

  startTransition(currentStep + 1);
}

function previousStep() {
  playToEnd = false;

  if (playing) {
    finishCurrentStep();
  }

  if (currentStep <= 0) {
    return;
  }

  startTransition(currentStep - 1);
}

// ==================================================
// Controls
// ==================================================

function styleControlButton(button) {
  button.type = "button";

  button.style.padding = "0.5rem 1rem";

  button.style.fontSize = "1rem";

  button.style.background = "#ffffff";

  button.style.border = "1px solid #999";

  button.style.borderRadius = "6px";

  button.style.cursor = "pointer";
}

function makeEditorButton(text, title) {
  const button = document.createElement("button");

  button.type = "button";

  button.textContent = text;

  button.title = title;

  button.style.padding = "0.25rem 0.5rem";

  button.style.fontSize = "0.75rem";

  button.style.background = "#ffffff";

  button.style.border = "1px solid #aaa";

  button.style.borderRadius = "4px";

  button.style.cursor = "pointer";

  return button;
}

const controls = document.createElement("div");

controls.style.position = "absolute";
controls.style.left = "1.25rem";
controls.style.top = "1.25rem";
controls.style.display = "flex";
controls.style.flexDirection = "column";
controls.style.alignItems = "flex-start";
controls.style.gap = "0.75rem";

document.body.appendChild(controls);

const buttonRow = document.createElement("div");

buttonRow.style.display = "flex";
buttonRow.style.gap = "1rem";

controls.appendChild(buttonRow);

const previousButton = document.createElement("button");

previousButton.textContent = "⏮";

previousButton.title = "Previous transformation";

styleControlButton(previousButton);

const nextButton = document.createElement("button");

nextButton.textContent = "⏭";

nextButton.title = "Next transformation";

styleControlButton(nextButton);

const playButton = document.createElement("button");

playButton.textContent = "▶";

playButton.title = "Play the whole chain";

styleControlButton(playButton);

const resetButton = document.createElement("button");

resetButton.textContent = "↻";

resetButton.title = "Reset to the original grid";

styleControlButton(resetButton);

buttonRow.appendChild(previousButton);

buttonRow.appendChild(nextButton);

buttonRow.appendChild(playButton);

buttonRow.appendChild(resetButton);

previousButton.addEventListener("click", previousStep);

nextButton.addEventListener("click", nextStep);

playButton.addEventListener("click", playAll);

resetButton.addEventListener("click", reset);

// ==================================================
// Step indicator
// ==================================================

const stepLabel = document.createElement("div");

stepLabel.style.fontFamily = "Arial, sans-serif";

stepLabel.style.fontSize = "1rem";

stepLabel.style.color = "#333";

controls.appendChild(stepLabel);

// ==================================================
// Unit circle toggle
// ==================================================

const unitCircleToggle = document.createElement("label");

unitCircleToggle.style.display = "flex";

unitCircleToggle.style.alignItems = "center";

unitCircleToggle.style.gap = "0.4rem";

unitCircleToggle.style.fontFamily = "Arial, sans-serif";

unitCircleToggle.style.fontSize = "0.9rem";

unitCircleToggle.style.color = "#333";

unitCircleToggle.style.cursor = "pointer";

unitCircleToggle.style.userSelect = "none";

const unitCircleCheckbox = document.createElement("input");

unitCircleCheckbox.type = "checkbox";

unitCircleCheckbox.checked = false;

unitCircleCheckbox.style.margin = "0";

unitCircleCheckbox.style.accentColor = "#1565c0";

unitCircleCheckbox.style.cursor = "pointer";

unitCircleCheckbox.addEventListener("change", () => {
  unitCircle.visible = unitCircleCheckbox.checked;
});

unitCircleToggle.appendChild(unitCircleCheckbox);

unitCircleToggle.appendChild(document.createTextNode("Show unit circle"));

controls.appendChild(unitCircleToggle);

// Sync the initial visibility with the checkbox state.

unitCircle.visible = unitCircleCheckbox.checked;

// ==================================================
// Eigenvector and singular vector toggles
// ==================================================

function makeVectorToggle(text, accentColor) {
  const label = document.createElement("label");

  label.style.display = "flex";
  label.style.alignItems = "center";
  label.style.gap = "0.4rem";
  label.style.fontFamily = "Arial, sans-serif";
  label.style.fontSize = "0.9rem";
  label.style.color = "#333";
  label.style.cursor = "pointer";
  label.style.userSelect = "none";

  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = false;
  checkbox.style.margin = "0";
  checkbox.style.accentColor = accentColor;
  checkbox.style.cursor = "pointer";

  label.appendChild(checkbox);

  label.appendChild(document.createTextNode(text));

  return { label, checkbox };
}

const eigenvectorToggle = makeVectorToggle("Show eigenvectors", "#e65100");

const singularVectorToggle = makeVectorToggle(
  "Show singular vectors",
  "#6a1b9a",
);

controls.appendChild(eigenvectorToggle.label);

controls.appendChild(singularVectorToggle.label);

eigenvectorToggle.checkbox.addEventListener("change", () => {
  showEigenvectors = eigenvectorToggle.checkbox.checked;

  if (
    showEigenvectors &&
    computeEigenvectors(computeChainProduct()) === null
  ) {
    showMessage(
      "This transformation has complex eigenvalues, so it has no real eigenvectors.",
    );
  }

  refreshOverlayVectors();
});

singularVectorToggle.checkbox.addEventListener("change", () => {
  showSingularVectors = singularVectorToggle.checkbox.checked;

  refreshOverlayVectors();
});

function clearVectorOverlays() {
  eigenvectorToggle.checkbox.checked = false;

  singularVectorToggle.checkbox.checked = false;

  showEigenvectors = false;

  showSingularVectors = false;

  eigenvectorSteps = null;

  rightSingularSteps = null;

  leftSingularReferences = null;

  overlayProgress = 1;

  hideOverlayGroup(eigenvectorArrows, eigenvectorLabels);

  hideOverlayGroup(rightSingularArrows, rightSingularLabels);

  hideOverlayGroup(leftSingularArrows, leftSingularLabels);
}

// ==================================================
// Message area
// ==================================================

const messageDisplay = document.createElement("div");

messageDisplay.style.display = "none";

messageDisplay.style.fontFamily = "Arial, sans-serif";

messageDisplay.style.fontSize = "0.8rem";

messageDisplay.style.lineHeight = "1.35";

messageDisplay.style.color = "#b00020";

messageDisplay.style.background = "#fff3f3";

messageDisplay.style.border = "1px solid #f0c0c0";

messageDisplay.style.borderRadius = "4px";

messageDisplay.style.padding = "0.45rem 0.55rem";

messageDisplay.style.maxWidth = "19rem";

controls.appendChild(messageDisplay);

let messageTimer = null;

function showMessage(text) {
  messageDisplay.textContent = text;

  messageDisplay.style.display = "block";

  if (messageTimer !== null) {
    clearTimeout(messageTimer);
  }

  messageTimer = setTimeout(() => {
    messageDisplay.textContent = "";

    messageDisplay.style.display = "none";

    messageTimer = null;
  }, 6000);
}

function clearMessage() {
  if (messageTimer !== null) {
    clearTimeout(messageTimer);

    messageTimer = null;
  }

  messageDisplay.textContent = "";

  messageDisplay.style.display = "none";
}

// ==================================================
// Matrix editor
// ==================================================

const editor = document.createElement("div");

editor.style.background = "rgba(255, 255, 255, 0.92)";

editor.style.border = "1px solid #ccc";

editor.style.borderRadius = "8px";

editor.style.padding = "0.75rem";

editor.style.width = "19rem";

editor.style.boxSizing = "border-box";

editor.style.maxHeight = "calc(100vh - 12rem)";

editor.style.overflowY = "auto";

editor.style.fontFamily = "Arial, sans-serif";

editor.style.fontSize = "0.85rem";

editor.style.color = "#222";

editor.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.08)";

controls.appendChild(editor);

function renderMatrixEditor() {
  editor.innerHTML = "";

  // ----------------------------------------------
  // Editor header
  // ----------------------------------------------

  const editorHeader = document.createElement("div");

  editorHeader.style.display = "flex";

  editorHeader.style.alignItems = "center";

  editorHeader.style.gap = "0.5rem";

  editorHeader.style.marginBottom = "0.5rem";

  const editorTitle = document.createElement("div");

  editorTitle.textContent = "Matrix chain";

  editorTitle.style.fontWeight = "bold";

  editorTitle.style.flex = "1";

  const addButton = makeEditorButton("+ Add Matrix", "Add a new 2 × 2 matrix");

  addButton.addEventListener("click", () => {
    matrices.push([
      [1, 0],
      [0, 1],
    ]);

    handleChainChange();

    editor.scrollTop = editor.scrollHeight;
  });

  editorHeader.appendChild(editorTitle);

  editorHeader.appendChild(addButton);

  editor.appendChild(editorHeader);

  // ----------------------------------------------
  // Empty state
  // ----------------------------------------------

  if (matrices.length === 0) {
    const emptyMessage = document.createElement("div");

    emptyMessage.textContent = "No matrices yet. Add one to begin.";

    emptyMessage.style.color = "#666";

    emptyMessage.style.fontStyle = "italic";

    emptyMessage.style.padding = "0.25rem 0";

    editor.appendChild(emptyMessage);

    return;
  }

  // ----------------------------------------------
  // Matrix cards
  // ----------------------------------------------

  for (let i = 0; i < matrices.length; i++) {
    const matrix = matrices[i];

    const card = document.createElement("div");

    card.style.padding = i === 0 ? "0 0 0.65rem" : "0.65rem 0";

    card.style.borderTop = i === 0 ? "none" : "1px solid #e4e4e4";

    // --------------------------------------------
    // Card header
    // --------------------------------------------

    const header = document.createElement("div");

    header.style.display = "flex";

    header.style.alignItems = "center";

    header.style.gap = "0.3rem";

    header.style.marginBottom = "0.45rem";

    const title = document.createElement("div");

    title.innerHTML = `
      <strong>Matrix ${i + 1}</strong>

      <span style="
        color: #777;
        font-weight: normal;
        font-size: 0.75rem;
      ">(step ${i + 1})</span>
    `;

    title.style.flex = "1";

    const upButton = makeEditorButton("↑", "Move this matrix earlier");

    upButton.disabled = i === 0;

    upButton.addEventListener("click", () => {
      if (i === 0) {
        return;
      }

      [matrices[i - 1], matrices[i]] = [matrices[i], matrices[i - 1]];

      handleChainChange();
    });

    const downButton = makeEditorButton("↓", "Move this matrix later");

    downButton.disabled = i === matrices.length - 1;

    downButton.addEventListener("click", () => {
      if (i === matrices.length - 1) {
        return;
      }

      [matrices[i], matrices[i + 1]] = [matrices[i + 1], matrices[i]];

      handleChainChange();
    });

    const deleteButton = makeEditorButton("✕", "Delete this matrix");

    deleteButton.style.color = "#b00020";

    deleteButton.style.borderColor = "#d9a0a0";

    deleteButton.addEventListener("click", () => {
      matrices.splice(i, 1);

      handleChainChange();
    });

    header.appendChild(title);

    header.appendChild(upButton);

    header.appendChild(downButton);

    header.appendChild(deleteButton);

    card.appendChild(header);

    // --------------------------------------------
    // Card body
    // --------------------------------------------

    const body = document.createElement("div");

    body.style.display = "flex";

    body.style.alignItems = "flex-start";

    body.style.gap = "0.55rem";

    const inputGrid = document.createElement("div");

    inputGrid.style.display = "grid";

    inputGrid.style.gridTemplateColumns = "repeat(2, 5rem)";

    inputGrid.style.gap = "0.3rem";

    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 2; column++) {
        const input = document.createElement("input");

        input.type = "number";

        input.step = "any";

        input.value = formatInputValue(matrix[row][column]);

        input.setAttribute(
          "aria-label",
          `Matrix ${i + 1}, row ${row + 1}, column ${column + 1}`,
        );

        input.style.width = "5rem";

        input.style.boxSizing = "border-box";

        input.style.padding = "0.3rem 0.25rem";

        input.style.border = "1px solid #bbb";

        input.style.borderRadius = "4px";

        input.style.fontFamily = "Arial, sans-serif";

        input.style.fontSize = "0.9rem";

        input.style.textAlign = "center";

        input.addEventListener("input", () => {
          const value = parseFloat(input.value);

          if (!Number.isFinite(value)) {
            return;
          }

          matrix[row][column] = value;

          handleChainChange({ rebuildEditor: false });
        });

        input.addEventListener("blur", () => {
          input.value = formatInputValue(matrix[row][column]);
        });

        inputGrid.appendChild(input);
      }
    }

    const operationColumn = document.createElement("div");

    operationColumn.style.display = "flex";

    operationColumn.style.flexDirection = "column";

    operationColumn.style.gap = "0.3rem";

    const transposeButton = makeEditorButton(
      "Transpose",
      "Replace this matrix with its transpose",
    );

    transposeButton.style.width = "5.5rem";

    transposeButton.addEventListener("click", () => {
      matrices[i] = [
        [matrix[0][0], matrix[1][0]],
        [matrix[0][1], matrix[1][1]],
      ];

      handleChainChange();
    });

    const inverseButton = makeEditorButton(
      "Inverse",
      "Replace this matrix with its inverse",
    );

    inverseButton.style.width = "5.5rem";

    inverseButton.addEventListener("click", () => {
      const determinant =
        matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

      // ------------------------------------------
      // Singular matrix: reject the operation
      // ------------------------------------------

      if (Math.abs(determinant) < 1e-12) {
        showMessage(
          `Matrix ${i + 1} is singular (determinant = 0), so it has no inverse. The matrix was left unchanged.`,
        );

        return;
      }

      matrices[i] = inverse(new Matrix(matrix))
        .to2DArray()
        .map((row) => row.map(cleanNumber));

      handleChainChange();
    });

    operationColumn.appendChild(transposeButton);

    operationColumn.appendChild(inverseButton);

    body.appendChild(inputGrid);

    body.appendChild(operationColumn);

    card.appendChild(body);

    editor.appendChild(card);
  }
}

// ==================================================
// Step label
// ==================================================

function updateStepLabel() {
  if (matrices.length === 0) {
    stepLabel.textContent = "No transformations";

    return;
  }

  const displayedStep = playing ? targetStep : currentStep;

  stepLabel.textContent = "Step " + displayedStep + " / " + matrices.length;
}

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

    updateOverlayVectors(1);

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

    updateUnitCircleGeometry(unitCircleAnimationTarget);

    updateLabelPositions(animationE1Target, animationE2Target);

    if (elapsed > PAUSE_BEFORE + TRANSFORM_TIME + PAUSE_AFTER) {
      // Commit this transformation.
      commitStep();

      currentStep = targetStep;

      if (playToEnd && currentStep < matrices.length) {
        // Immediately prepare the next forward transformation.

        startTransition(currentStep + 1);

        updateStepLabel();

        updateOverlayVectors(0);

        renderer.render(scene, camera);

        // IMPORTANT:
        //
        // Do not continue into the interpolation
        // code below. Otherwise t = 1 from the old
        // animation gets applied to the new one.

        return;
      }

      // --------------------------------------------
      // Chain finished (or a single step finished)
      // --------------------------------------------

      playing = false;

      animationStart = null;

      stepDirection = 0;

      playToEnd = false;

      refreshMatrixLabel();
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

    // =================================================
    // Interpolate unit circle
    // =================================================

    const circleCurrent = unitCircleAnimationStart.map((start, i) => {
      const target = unitCircleAnimationTarget[i];

      return new THREE.Vector2(
        THREE.MathUtils.lerp(start.x, target.x, t),

        THREE.MathUtils.lerp(start.y, target.y, t),
      );
    });

    updateUnitCircleGeometry(circleCurrent);
  }

  updateStepLabel();

  updateOverlayVectors(t);

  renderer.render(scene, camera);
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

renderMatrixEditor();

refreshProductLabel();

updateArrow(e1, currentE1);

updateArrow(e2, currentE2);

reset();

// ==================================================
// Start
// ==================================================

animate(performance.now());
