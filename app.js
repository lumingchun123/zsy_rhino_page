import * as THREE from "three";
import { OrbitControls } from "./vendor/three/OrbitControls.js";
import { GLTFLoader } from "./vendor/three/GLTFLoader.js";
import { DRACOLoader } from "./vendor/three/DRACOLoader.js";
import { mergeGeometries } from "./vendor/utils/BufferGeometryUtils.js";
import RotateCcw from "./vendor/lucide/icons/rotate-ccw.js";
import Play from "./vendor/lucide/icons/play.js";
import Pause from "./vendor/lucide/icons/pause.js";
import Scan from "./vendor/lucide/icons/scan.js";
import PanelRightClose from "./vendor/lucide/icons/panel-right-close.js";
import PanelRightOpen from "./vendor/lucide/icons/panel-right-open.js";
import Maximize from "./vendor/lucide/icons/maximize.js";
import Box from "./vendor/lucide/icons/box.js";
import X from "./vendor/lucide/icons/x.js";

const canvas = document.querySelector("#modelCanvas");
const modelSelect = document.querySelector("#modelSelect");
const loadState = document.querySelector("#loadState");
const metrics = document.querySelector("#metrics");
const loadingLayer = document.querySelector("#loadingLayer");
const loadingTitle = document.querySelector("#loadingTitle");
const loadingDetail = document.querySelector("#loadingDetail");
const progressBar = document.querySelector("#progressBar");
const controlPanel = document.querySelector("#controlPanel");
const toast = document.querySelector("#toast");
const ambientInput = document.querySelector("#ambientInput");
const exposureInput = document.querySelector("#exposureInput");
const sectionInput = document.querySelector("#sectionInput");
const ambientValue = document.querySelector("#ambientValue");
const exposureValue = document.querySelector("#exposureValue");
const sectionValue = document.querySelector("#sectionValue");
const drawingStrip = document.querySelector("#drawingStrip");
const imageViewer = document.querySelector("#imageViewer");
const viewerImage = document.querySelector("#viewerImage");
const viewerCaption = document.querySelector("#viewerCaption");

const icons = {
  "rotate-ccw": RotateCcw,
  play: Play,
  pause: Pause,
  scan: Scan,
  "panel-right-close": PanelRightClose,
  "panel-right-open": PanelRightOpen,
  maximize: Maximize,
  box: Box,
  x: X,
};

const FULL_MODEL_ID = "glb-full-model2";
const MOBILE_MODEL_ID = "glb-mobile-model";
const ASSET_VERSION = "20260510-merge1";

const modelOptions = [
  {
    id: MOBILE_MODEL_ID,
    label: "Mobile lightweight model",
    url: `./assets/mobile.glb?v=${ASSET_VERSION}`,
    type: "glb",
    note: "2.7 MB",
  },
  {
    id: FULL_MODEL_ID,
    label: "Final material model / 1.glb",
    url: `./assets/model2.glb?v=${ASSET_VERSION}`,
    type: "glb",
    note: "80 MB",
  },
];

const drawingGroups = [
  {
    id: "plans",
    title: "平面",
    label: "Plans",
    items: [
      ["plan-diy-1", "手工 DIY 工坊一层平面图", "Handcraft DIY Workshop First Floor Plan"],
      ["plan-diy-2", "手工 DIY 工坊二层平面图", "Handcraft DIY Workshop Second Floor Plan"],
      ["plan-diy-bridge", "手工 DIY 工坊与连桥平面图", "Handcraft DIY Workshop and Bridge Plan"],
      ["plan-livehouse", "Livehouse 平面图", "Livehouse Plan"],
      ["plan-cafe", "咖啡店平面图", "Cafe Plan"],
      ["plan-board-game", "桌游店平面图", "Board Game Store Plan"],
      ["plan-work-1f", "工作楼一层平面图", "Work Building First Floor Plan"],
      ["plan-work-2f", "工作楼二层平面图", "Work Building Second Floor Plan"],
      ["plan-life-1f", "生活楼一层平面图", "Life Building First Floor Plan"],
      ["plan-life-2f", "生活楼二层平面图", "Life Building Second Floor Plan"],
    ],
  },
  {
    id: "sections",
    title: "剖面",
    label: "Sections",
    items: [
      ["section-work-life", "工作-生活综合剖透视图", "Work-Life Sectional Perspective"],
      ["section-work", "工作楼剖透视图", "Work Building Sectional Perspective"],
      ["section-life", "生活楼剖透视图", "Life Building Sectional Perspective"],
      ["section-board-game", "桌游店剖面图", "Board Game Store Section"],
      ["section-diy-gallery", "手工 DIY 工坊与画廊剖面图", "Handcraft DIY Workshop and Gallery Section"],
      ["section-livehouse", "Livehouse 剖面图", "Livehouse Section"],
      ["section-cafe", "咖啡店剖面图", "Cafe Section"],
    ],
  },
  {
    id: "elevations",
    title: "立面",
    label: "Elevations",
    items: [
      ["elevation-front", "正立面图", "Front Elevation"],
      ["elevation-rear", "背立面图", "Rear Elevation"],
      ["elevation-left", "左侧立面图", "Left Elevation"],
      ["elevation-right", "右侧立面图", "Right Elevation"],
    ],
  },
  {
    id: "renderings",
    title: "效果图",
    label: "Renderings",
    items: [
      ["rendering-cafe-plaza", "咖啡店外摆广场", "Cafe Plaza Gathering", "jpg"],
      ["rendering-rooftop-deck", "屋顶栈道活动平台", "Rooftop Deck and Activity Terrace", "jpg"],
      ["rendering-aerial-cluster", "社区组团鸟瞰", "Aerial Community Cluster", "jpg"],
      ["rendering-bridge-courtyard", "连桥庭院视角", "Bridge Courtyard View", "jpg"],
      ["rendering-terrace-overview", "台地与建筑群鸟瞰", "Terraced Community Overview", "jpg"],
      ["rendering-central-walkway", "中央栈道节点", "Central Walkway Node", "jpg"],
      ["rendering-public-entry", "公共入口广场", "Public Entry Plaza", "jpg"],
      ["rendering-planter-deck", "树池栈道节点", "Planter Deck Node", "jpg"],
      ["rendering-plaza-overlook", "公共广场俯视", "Public Plaza Overlook", "jpg"],
      ["rendering-pedestrian-plaza", "步行广场近景", "Pedestrian Plaza Close-Up", "jpg"],
      ["rendering-community-gathering", "社区聚集场景", "Community Gathering Court", "jpg"],
      ["rendering-garden-bench", "花园长椅休憩区", "Garden Bench Rest Area", "jpg"],
      ["rendering-lawn-rest", "草地休憩角", "Lawn Rest Corner", "jpg"],
      ["rendering-rooftop-activity", "屋顶活动平台", "Rooftop Activity Platform", "jpg"],
      ["rendering-facade-bridge", "建筑立面与连桥", "Facade and Bridge Detail", "jpg"],
      ["rendering-garden-facade", "庭院立面入口", "Garden Facade Entrance", "jpg"],
    ],
  },
];

const MODEL_ORIENTATION_X_RADIANS = -Math.PI / 2;
const WALKER_LOOP_SECONDS = 12;

const state = {
  currentObject: null,
  currentBox: new THREE.Box3(),
  currentSize: new THREE.Vector3(1, 1, 1),
  currentMode: "material",
  walker: null,
  loadToken: 0,
  started: false,
  sectionEnabled: false,
  panelVisible: true,
  toastTimer: 0,
};

window.__modelShowcase = {
  status: "init",
  url: "",
  meshCount: 0,
  triangles: 0,
};

const materials = {
  white: new THREE.MeshStandardMaterial({
    color: 0xf2f1eb,
    roughness: 0.66,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }),
  fallback: new THREE.MeshStandardMaterial({
    color: 0xd2d7cf,
    roughness: 0.74,
    metalness: 0.04,
    side: THREE.DoubleSide,
  }),
};

const layerPalette = [0x61776a, 0xb36648, 0x536f8d, 0xc6a15b, 0x8b7367, 0x4f665f, 0x9a5f6a];
const layerMaterials = layerPalette.map(
  (color) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
);

const walkerMaterials = {
  head: new THREE.MeshStandardMaterial({ color: 0xf0c64a, roughness: 0.58, metalness: 0.02 }),
  face: new THREE.MeshBasicMaterial({ color: 0x151515 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0x17739a, roughness: 0.62, metalness: 0.02 }),
  hand: new THREE.MeshStandardMaterial({ color: 0xf0c64a, roughness: 0.58, metalness: 0.02 }),
  trousers: new THREE.MeshStandardMaterial({ color: 0x1d2f36, roughness: 0.78, metalness: 0.01 }),
  shoe: new THREE.MeshStandardMaterial({ color: 0x111716, roughness: 0.86, metalness: 0.01 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x20302c, transparent: true, opacity: 0.16, depthWrite: false }),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe4df);
scene.fog = new THREE.Fog(0xdfe4df, 80, 420);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 5000);
camera.position.set(24, 18, 28);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileClient() ? 1 : 1.35));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.localClippingEnabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.screenSpacePanning = false;
controls.autoRotateSpeed = 0.7;
controls.target.set(0, 0, 0);

const modelRoot = new THREE.Group();
scene.add(modelRoot);

const clock = new THREE.Clock();

const ambientLight = new THREE.HemisphereLight(0xffffff, 0xa5aa9f, 0.65);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(40, 60, 30);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd9e9ff, 0.9);
fillLight.position.set(-30, 24, -36);
scene.add(fillLight);

const clippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./vendor/draco/");
dracoLoader.setDecoderConfig({ type: "wasm" });
gltfLoader.setDRACOLoader(dracoLoader);
let rhinoLoaderPromise = null;

export async function startViewer(preferredId = "auto") {
  if (state.started) {
    const option = modelOptions.find((item) => item.id === resolvePreferredModelId(preferredId));
    if (option) {
      modelSelect.value = option.id;
      loadModel(option);
    }
    return;
  }

  state.started = true;
  renderIcons();
  renderDrawings();
  populateModelSelect();
  wireEvents();
  initializeResponsivePanel();
  resize();
  animate();
  await boot(preferredId);
}

async function boot(preferredId = "auto") {
  let preferred = null;

  for (const id of getModelFallbackOrder(preferredId)) {
    const option = modelOptions.find((item) => item.id === id);
    if (option && (await assetExists(option.url))) {
      preferred = option;
      break;
    }
  }

  if (!preferred || !(await assetExists(preferred.url))) {
    showLoading("模型文件缺失", "请确认 assets 文件夹里有 mobile.glb 或 model2.glb");
    loadState.value = "缺失";
    window.__modelShowcase.status = "error";
    return;
  }

  modelSelect.value = preferred.id;
  loadModel(preferred);
}

function resolvePreferredModelId(preferredId) {
  if (preferredId && preferredId !== "auto") return preferredId;
  return isMobileClient() ? MOBILE_MODEL_ID : FULL_MODEL_ID;
}

function getModelFallbackOrder(preferredId) {
  const preferred = resolvePreferredModelId(preferredId);
  const fallback = preferred === MOBILE_MODEL_ID ? FULL_MODEL_ID : MOBILE_MODEL_ID;
  return [preferred, fallback];
}

function isMobileClient() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const touchMac = platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) || touchMac;
  const coarseSmallScreen =
    window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 900px)").matches;

  return mobileUserAgent || coarseSmallScreen;
}

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((slot) => {
    const icon = icons[slot.dataset.icon];
    if (!icon) return;
    slot.replaceChildren(createIcon(icon));
  });
}

function createIcon(icon) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  icon.forEach(([tag, attrs]) => {
    const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, value));
    svg.appendChild(child);
  });

  return svg;
}

function renderDrawings() {
  drawingStrip.replaceChildren(
    ...drawingGroups.map((group) => {
      const section = document.createElement("section");
      section.className = "drawing-group";
      section.setAttribute("aria-label", `${group.title} ${group.label}`);

      const heading = document.createElement("div");
      heading.className = "drawing-group-heading";
      heading.innerHTML = `<strong>${group.title}</strong><span>${group.label}</span>`;

      const grid = document.createElement("div");
      grid.className = "drawing-grid";

      group.items.forEach(([slug, zhTitle, enTitle, fullExt = "png"]) => {
        const button = document.createElement("button");
        button.className = "thumb";
        button.type = "button";
        button.dataset.image = `./assets/drawings/full/${slug}.${fullExt}`;
        button.dataset.caption = `${zhTitle} / ${enTitle}`;
        button.title = zhTitle;
        button.setAttribute("aria-label", `${zhTitle} ${enTitle}`);

        const image = document.createElement("img");
        image.src = `./assets/drawings/thumbs/${slug}.jpg`;
        image.alt = zhTitle;
        image.loading = "lazy";

        const title = document.createElement("span");
        title.className = "thumb-title";
        title.textContent = zhTitle;

        const subtitle = document.createElement("small");
        subtitle.textContent = enTitle;

        button.append(image, title, subtitle);
        grid.append(button);
      });

      section.append(heading, grid);
      return section;
    }),
  );
}

function populateModelSelect() {
  modelOptions.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.id;
    item.textContent = `${option.label} · ${option.note}`;
    modelSelect.append(item);
  });
}

function wireEvents() {
  window.addEventListener("resize", resize);

  modelSelect.addEventListener("change", () => {
    const next = modelOptions.find((option) => option.id === modelSelect.value);
    if (next) loadModel(next);
  });

  document.querySelectorAll("[data-view-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-view-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.currentMode = button.dataset.viewMode;
      applyMaterialMode();
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button));
  });

  ambientInput.addEventListener("input", () => {
    const value = Number(ambientInput.value);
    ambientValue.value = `${value}%`;
    ambientLight.intensity = value / 100;
  });

  exposureInput.addEventListener("input", () => {
    const value = Number(exposureInput.value);
    exposureValue.value = `${value}%`;
    renderer.toneMappingExposure = value / 100;
  });

  sectionInput.addEventListener("input", () => {
    const value = Number(sectionInput.value);
    sectionValue.value = `${value}%`;
    updateClippingPlane();
  });

  drawingStrip.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest(".thumb");
    if (button) {
      viewerImage.src = button.dataset.image;
      viewerImage.alt = button.title || "图纸预览";
      viewerCaption.textContent = button.dataset.caption || button.title || "";
      imageViewer.showModal();
    }
  });

  imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) imageViewer.close();
  });
}

function handleAction(button) {
  const action = button.dataset.action;

  if (action === "reset-view") {
    frameObject();
    flash("视角已重置");
  }

  if (action === "toggle-rotate") {
    controls.autoRotate = !controls.autoRotate;
    button.classList.toggle("active", controls.autoRotate);
    button.querySelector("[data-icon], svg")?.replaceWith(createIcon(controls.autoRotate ? Pause : Play));
  }

  if (action === "toggle-section") {
    state.sectionEnabled = !state.sectionEnabled;
    button.classList.toggle("active", state.sectionEnabled);
    applyClipping();
    flash(state.sectionEnabled ? "剖切已开启" : "剖切已关闭");
  }

  if (action === "toggle-panel") {
    setPanelVisible(!state.panelVisible);
  }

  if (action === "fullscreen") {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.querySelector(".viewer-shell").requestFullscreen();
    }
  }

  if (action === "close-image") {
    imageViewer.close();
  }
}

async function assetExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

function loadModel(option) {
  const token = ++state.loadToken;
  window.__modelShowcase.status = "loading";
  window.__modelShowcase.url = option.url;
  showLoading(`正在加载 ${option.label}`, option.note);
  loadState.value = "加载中";
  progressBar.style.width = "4%";
  modelRoot.clear();
  state.currentObject = null;
  state.walker = null;

  const onProgress = (event) => {
    if (token !== state.loadToken) return;
    if (event.lengthComputable && event.total > 0) {
      const progress = Math.max(4, Math.min(92, (event.loaded / event.total) * 92));
      progressBar.style.width = `${progress}%`;
      loadingDetail.textContent = `${formatBytes(event.loaded)} / ${formatBytes(event.total)}`;
    } else {
      progressBar.style.width = "36%";
      loadingDetail.textContent = "正在解析模型";
    }
  };

  const onLoaded = async (object) => {
    if (token !== state.loadToken) return;

    try {
      const optimized = await optimizeObjectForViewer(object, token);
      if (token !== state.loadToken) return;

      prepareModel(optimized);
      modelRoot.add(optimized);
      state.currentObject = optimized;
      attachWalkingPerson();
      frameObject();
      applyMaterialMode();
      applyClipping();
      updateMetrics();
      progressBar.style.width = "100%";
      loadState.value = "已加载";
      window.__modelShowcase.status = "loaded";
      setTimeout(() => hideLoading(), 280);
    } catch (error) {
      onError(error);
    }
  };

  const onError = (error) => {
    if (token !== state.loadToken) return;
    console.error(error);
    loadState.value = "失败";
    window.__modelShowcase.status = "error";
    showLoading("模型加载失败", "请换用较轻的 GLB，或把 Rhino8 导出的模型放入 assets 文件夹");
    progressBar.style.width = "0%";
  };

  if (option.type === "glb" || option.type === "gltf") {
    gltfLoader.load(option.url, (gltf) => onLoaded(gltf.scene), onProgress, onError);
    return;
  }

  getRhinoLoader()
    .then((loader) => loader.load(option.url, onLoaded, onProgress, onError))
    .catch(onError);
}

async function getRhinoLoader() {
  if (!rhinoLoaderPromise) {
    rhinoLoaderPromise = import("./vendor/three/3DMLoader.js").then(({ Rhino3dmLoader }) => {
      const loader = new Rhino3dmLoader();
      loader.setLibraryPath("./vendor/rhino3dm/");
      return loader;
    });
  }

  return rhinoLoaderPromise;
}

async function optimizeObjectForViewer(object, token) {
  const meshes = [];
  object.updateWorldMatrix(true, true);

  object.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    if (Array.isArray(child.material)) return;
    meshes.push(child);
  });

  window.__modelShowcase.meshCountRaw = meshes.length;

  if (meshes.length < 1800) return object;

  window.__modelShowcase.status = "optimizing";
  loadState.value = "优化中";
  loadingTitle.textContent = "正在优化模型";
  loadingDetail.textContent = `正在合并 ${formatNumber(meshes.length)} 个构件，减少网页卡顿`;
  progressBar.style.width = "94%";
  await nextFrame();

  const buckets = new Map();

  for (let index = 0; index < meshes.length; index += 1) {
    if (token !== state.loadToken) return object;

    const mesh = meshes[index];
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);

    const attributeKey = Object.entries(geometry.attributes)
      .map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.normalized ? 1 : 0}`)
      .sort()
      .join("|");
    const material = mesh.material || materials.fallback;
    const key = `${material.uuid}|${geometry.index ? "indexed" : "flat"}|${attributeKey}`;

    if (!buckets.has(key)) {
      buckets.set(key, { geometries: [], material });
    }

    buckets.get(key).geometries.push(geometry);

    if (index > 0 && index % 1200 === 0) {
      loadingDetail.textContent = `正在整理构件 ${formatNumber(index)} / ${formatNumber(meshes.length)}`;
      await nextFrame();
    }
  }

  const optimized = new THREE.Group();
  optimized.name = object.name || "optimized-model";
  let mergedMeshCount = 0;

  for (const bucket of buckets.values()) {
    if (token !== state.loadToken) return object;

    const mergedGeometry =
      bucket.geometries.length === 1 ? bucket.geometries[0] : mergeGeometries(bucket.geometries, false);

    if (!mergedGeometry) {
      bucket.geometries.forEach((geometry) => {
        optimized.add(new THREE.Mesh(geometry, bucket.material));
        mergedMeshCount += 1;
      });
      continue;
    }

    optimized.add(new THREE.Mesh(mergedGeometry, bucket.material));
    mergedMeshCount += 1;

    bucket.geometries.forEach((geometry) => {
      if (geometry !== mergedGeometry) geometry.dispose();
    });
  }

  object.traverse((child) => {
    if (child.isMesh) child.geometry?.dispose?.();
  });

  window.__modelShowcase.meshCountOptimized = mergedMeshCount;
  loadingDetail.textContent = `已合并为 ${formatNumber(mergedMeshCount)} 个绘制批次`;
  await nextFrame();
  return optimized;
}

function prepareModel(object) {
  object.rotation.x += MODEL_ORIENTATION_X_RADIANS;
  object.updateMatrixWorld(true);
  window.__modelShowcase.rotationDegrees = -90;

  object.traverse((child) => {
    if (!child.isMesh) return;

    if (!child.geometry.attributes.normal) {
      child.geometry.computeVertexNormals();
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.originalMaterial = child.material || materials.fallback;

    applyToMaterials(child.material, (material) => {
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
    });
  });

  state.currentBox.setFromObject(object);
  const center = state.currentBox.getCenter(new THREE.Vector3());
  object.position.sub(center);
  state.currentBox.setFromObject(object);
  state.currentBox.getSize(state.currentSize);
  updateClippingPlane();
}

function attachWalkingPerson() {
  const maxDim = Math.max(state.currentSize.x, state.currentSize.y, state.currentSize.z, 1);
  const personHeight = THREE.MathUtils.clamp(maxDim * 0.008, 0.8, 1.45);
  const walker = createWalkingPerson(personHeight);
  const walkwaySamples = collectWalkwaySamples();
  const path = buildInteriorWalkPath(walkwaySamples, personHeight);

  walker.userData.path = {
    points: path.points,
    lengths: path.lengths,
    totalLength: path.totalLength,
    groundY: path.groundY,
    bob: personHeight * 0.025,
  };

  state.walker = walker;
  modelRoot.add(walker);
  updateWalkingPerson(clock.getElapsedTime());
  window.__modelShowcase.walker = "interior";
}

function collectWalkwaySamples() {
  const box = new THREE.Box3();
  const meshBox = new THREE.Box3();
  const walkwayName = /(栈道面板|existing_skin_steel|grating_solids|cross_solids|edge_beams|support_beams)/i;
  const samples = [];
  const position = new THREE.Vector3();

  state.currentObject.updateWorldMatrix(true, true);
  state.currentObject.traverse((child) => {
    if (!child.isMesh || !materialNameMatches(child.material, walkwayName)) return;
    const attribute = child.geometry?.attributes?.position;
    if (!attribute) return;

    meshBox.setFromObject(child);
    box.union(meshBox);

    const stride = Math.max(1, Math.floor(attribute.count / 1400));
    for (let index = 0; index < attribute.count; index += stride) {
      position.fromBufferAttribute(attribute, index).applyMatrix4(child.matrixWorld);
      samples.push(position.clone());
    }
  });

  return { box, samples };
}

function buildInteriorWalkPath(walkway, personHeight) {
  if (!walkway.samples.length || walkway.box.isEmpty()) {
    return buildFallbackWalkPath(personHeight);
  }

  const surfaceSamples = filterSurfaceSamples(walkway.samples, personHeight);
  const pathSamples = surfaceSamples.length >= 80 ? surfaceSamples : walkway.samples;
  const box = new THREE.Box3().setFromPoints(pathSamples);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const useXAxis = size.x >= size.z;
  const majorMin = useXAxis ? box.min.x : box.min.z;
  const majorMax = useXAxis ? box.max.x : box.max.z;
  const majorSpan = Math.max(majorMax - majorMin, personHeight * 6);
  const binCount = THREE.MathUtils.clamp(Math.round(majorSpan / Math.max(personHeight * 1.15, majorSpan * 0.055)), 12, 30);
  const bins = Array.from({ length: binCount }, () => []);

  pathSamples.forEach((sample) => {
    const major = useXAxis ? sample.x : sample.z;
    const index = THREE.MathUtils.clamp(Math.floor(((major - majorMin) / majorSpan) * binCount), 0, binCount - 1);
    bins[index].push(sample);
  });

  const centerline = [];
  let previous = null;

  bins.forEach((bin) => {
    const candidates = buildCenterlineCandidates(bin, useXAxis, personHeight);
    if (!candidates.length) return;

    const chosen = chooseCenterlineCandidate(candidates, previous, center);
    if (!previous || chosen.distanceTo(previous) > personHeight * 0.4) {
      centerline.push(chosen);
      previous = chosen;
    }
  });

  const points = smoothCenterline(centerline, personHeight);
  if (points.length < 4) return buildFallbackWalkPath(personHeight, box);

  const groundY = getQuantile(pathSamples.map((sample) => sample.y), 0.82) + personHeight * 0.02;
  const route = createOutAndBackPath(points.map((point) => new THREE.Vector3(point.x, groundY, point.z)));
  const measured = measureWalkRoute(route);

  window.__modelShowcase.walkerPath = {
    mode: "sampled-centerline",
    points: route.length,
    center: [Number(center.x.toFixed(2)), Number(center.y.toFixed(2)), Number(center.z.toFixed(2))],
    size: [Number(size.x.toFixed(2)), Number(size.y.toFixed(2)), Number(size.z.toFixed(2))],
  };

  return { points: route, lengths: measured.lengths, totalLength: measured.totalLength, groundY };
}

function buildFallbackWalkPath(personHeight, sourceBox = null) {
  const fallback = new THREE.Box3();
  const safeBox = sourceBox && !sourceBox.isEmpty() ? sourceBox : fallback;

  if (!sourceBox || sourceBox.isEmpty()) {
    const sceneCenter = state.currentBox.getCenter(new THREE.Vector3());
    fallback.min.set(sceneCenter.x - state.currentSize.x * 0.2, state.currentBox.min.y, sceneCenter.z - state.currentSize.z * 0.15);
    fallback.max.set(sceneCenter.x + state.currentSize.x * 0.2, state.currentBox.min.y + state.currentSize.y * 0.45, sceneCenter.z + state.currentSize.z * 0.2);
  }

  const center = safeBox.getCenter(new THREE.Vector3());
  const size = safeBox.getSize(new THREE.Vector3());
  const groundY = safeBox.max.y + personHeight * 0.02;
  const spanX = Math.max(size.x, personHeight * 5);
  const spanZ = Math.max(size.z, personHeight * 4);
  const points = [
    new THREE.Vector3(center.x - spanX * 0.34, groundY, center.z - spanZ * 0.12),
    new THREE.Vector3(center.x - spanX * 0.18, groundY, center.z + spanZ * 0.26),
    new THREE.Vector3(center.x + spanX * 0.18, groundY, center.z + spanZ * 0.22),
    new THREE.Vector3(center.x + spanX * 0.34, groundY, center.z - spanZ * 0.02),
    new THREE.Vector3(center.x + spanX * 0.06, groundY, center.z - spanZ * 0.24),
    new THREE.Vector3(center.x - spanX * 0.28, groundY, center.z - spanZ * 0.2),
  ];

  const measured = measureWalkRoute(points);

  window.__modelShowcase.walkerPath = {
    mode: "fallback",
    center: [Number(center.x.toFixed(2)), Number(center.y.toFixed(2)), Number(center.z.toFixed(2))],
    size: [Number(size.x.toFixed(2)), Number(size.y.toFixed(2)), Number(size.z.toFixed(2))],
  };

  return { points, lengths: measured.lengths, totalLength: measured.totalLength, groundY };
}

function filterSurfaceSamples(samples, personHeight) {
  const topY = getQuantile(samples.map((sample) => sample.y), 0.84);
  const band = Math.max(personHeight * 0.65, state.currentSize.y * 0.045);
  return samples.filter((sample) => sample.y >= topY - band);
}

function buildCenterlineCandidates(samples, useXAxis, personHeight) {
  if (samples.length < 5) return [];

  const sorted = [...samples].sort((a, b) => getMinorAxis(a, useXAxis) - getMinorAxis(b, useXAxis));
  const gap = Math.max(personHeight * 1.15, state.currentSize.z * 0.018);
  const clusters = [];
  let cluster = [];

  sorted.forEach((sample) => {
    const previous = cluster[cluster.length - 1];
    if (previous && Math.abs(getMinorAxis(sample, useXAxis) - getMinorAxis(previous, useXAxis)) > gap) {
      clusters.push(cluster);
      cluster = [];
    }
    cluster.push(sample);
  });

  if (cluster.length) clusters.push(cluster);

  return clusters
    .filter((item) => item.length >= 4)
    .map((item) => {
      const xs = item.map((sample) => sample.x);
      const ys = item.map((sample) => sample.y);
      const zs = item.map((sample) => sample.z);
      const point = new THREE.Vector3(getMedian(xs), getQuantile(ys, 0.82), getMedian(zs));
      point.userData = { weight: item.length };
      return point;
    });
}

function chooseCenterlineCandidate(candidates, previous, center) {
  if (!previous) {
    return candidates.reduce((best, item) => {
      const itemScore = Math.abs(item.z - center.z) - item.userData.weight * 0.015;
      const bestScore = Math.abs(best.z - center.z) - best.userData.weight * 0.015;
      return itemScore < bestScore ? item : best;
    }, candidates[0]);
  }

  return candidates.reduce((best, item) => {
    const itemScore = distance2D(item, previous) - item.userData.weight * 0.01;
    const bestScore = distance2D(best, previous) - best.userData.weight * 0.01;
    return itemScore < bestScore ? item : best;
  }, candidates[0]);
}

function smoothCenterline(points, personHeight) {
  const compact = points.filter((point, index) => index === 0 || distance2D(point, points[index - 1]) > personHeight * 0.6);
  if (compact.length < 3) return compact;

  return compact.map((point, index) => {
    if (index === 0 || index === compact.length - 1) return point.clone();
    const previous = compact[index - 1];
    const next = compact[index + 1];
    return new THREE.Vector3((previous.x + point.x * 2 + next.x) / 4, point.y, (previous.z + point.z * 2 + next.z) / 4);
  });
}

function createOutAndBackPath(points) {
  if (points.length < 3) return points;
  return [...points, ...points.slice(1, -1).reverse().map((point) => point.clone())];
}

function measureWalkRoute(points) {
  const lengths = [];
  let totalLength = 0;

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    totalLength += point.distanceTo(next);
    lengths.push(totalLength);
  });

  return { lengths, totalLength };
}

function getMinorAxis(point, useXAxis) {
  return useXAxis ? point.z : point.x;
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function getMedian(values) {
  return getQuantile(values, 0.5);
}

function getQuantile(values, amount) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * amount;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const mix = index - lower;
  return sorted[lower] * (1 - mix) + sorted[upper] * mix;
}

function materialNameMatches(material, pattern) {
  if (Array.isArray(material)) {
    return material.some((item) => materialNameMatches(item, pattern));
  }

  return pattern.test(material?.name || "");
}

function createWalkingPerson(height) {
  const person = new THREE.Group();
  person.name = "walking-scale-person";

  const torso = new THREE.Mesh(new THREE.BoxGeometry(height * 0.34, height * 0.34, height * 0.18), walkerMaterials.shirt);
  torso.position.y = height * 0.58;
  person.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.055, height * 0.055, height * 0.04, 16), walkerMaterials.head);
  neck.position.y = height * 0.78;
  person.add(neck);

  const head = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.13, height * 0.13, height * 0.17, 20), walkerMaterials.head);
  head.position.y = height * 0.89;
  person.add(head);

  const headStud = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.065, height * 0.065, height * 0.035, 16), walkerMaterials.head);
  headStud.position.y = height * 0.995;
  person.add(headStud);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(height * 0.012, 8, 6), walkerMaterials.face);
  leftEye.position.set(-height * 0.045, height * 0.91, height * 0.127);
  const rightEye = leftEye.clone();
  rightEye.position.x = height * 0.045;
  const smile = new THREE.Mesh(new THREE.BoxGeometry(height * 0.072, height * 0.01, height * 0.006), walkerMaterials.face);
  smile.position.set(0, height * 0.86, height * 0.13);
  person.add(leftEye, rightEye, smile);

  const leftLeg = createWalkerLimb(height * 0.105, height * 0.34, height * 0.12, walkerMaterials.trousers);
  leftLeg.position.set(-height * 0.065, height * 0.39, 0);
  const rightLeg = createWalkerLimb(height * 0.105, height * 0.34, height * 0.12, walkerMaterials.trousers);
  rightLeg.position.set(height * 0.065, height * 0.39, 0);
  person.add(leftLeg, rightLeg);

  const leftArm = createBlockArm(height, -1);
  leftArm.position.set(-height * 0.22, height * 0.72, 0);
  const rightArm = createBlockArm(height, 1);
  rightArm.position.set(height * 0.22, height * 0.72, 0);
  person.add(leftArm, rightArm);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(height * 0.13, height * 0.055, height * 0.18), walkerMaterials.shoe);
  leftFoot.position.set(-height * 0.065, height * 0.055, height * 0.045);
  const rightFoot = leftFoot.clone();
  rightFoot.position.x = height * 0.065;
  person.add(leftFoot, rightFoot);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(height * 0.26, 28), walkerMaterials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = height * 0.006;
  person.add(shadow);

  person.userData.parts = { leftLeg, rightLeg, leftArm, rightArm, leftFoot, rightFoot, shadow };
  return person;
}

function createWalkerLimb(width, length, depth, material) {
  const limb = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, length, depth), material);
  mesh.position.y = -length / 2;
  limb.add(mesh);
  return limb;
}

function createBlockArm(height, side) {
  const arm = new THREE.Group();
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(height * 0.075, height * 0.26, height * 0.085), walkerMaterials.shirt);
  sleeve.position.y = -height * 0.13;
  const hand = new THREE.Mesh(new THREE.SphereGeometry(height * 0.045, 10, 8), walkerMaterials.hand);
  hand.position.set(side * height * 0.006, -height * 0.29, height * 0.006);
  arm.add(sleeve, hand);
  return arm;
}

function updateWalkingPerson(elapsed) {
  if (!state.walker) return;

  const path = state.walker.userData.path;
  const parts = state.walker.userData.parts;
  const progress = ((elapsed / WALKER_LOOP_SECONDS) % 1) * path.totalLength;
  const current = sampleWalkPath(path, progress);
  const next = sampleWalkPath(path, (progress + path.totalLength * 0.01) % path.totalLength);
  const step = Math.sin(elapsed * 6.5);

  state.walker.position.set(current.x, path.groundY + Math.abs(step) * path.bob, current.z);
  state.walker.rotation.y = Math.atan2(next.x - current.x, next.z - current.z);

  parts.leftLeg.rotation.x = step * 0.55;
  parts.rightLeg.rotation.x = -step * 0.55;
  parts.leftArm.rotation.x = -step * 0.45;
  parts.rightArm.rotation.x = step * 0.45;
  parts.leftFoot.rotation.x = Math.max(0, step) * 0.3;
  parts.rightFoot.rotation.x = Math.max(0, -step) * 0.3;
  parts.shadow.scale.setScalar(1 + Math.abs(step) * 0.08);
}

function sampleWalkPath(path, distance) {
  let previousLength = 0;

  for (let index = 0; index < path.points.length; index += 1) {
    const segmentEnd = path.lengths[index];

    if (distance <= segmentEnd) {
      const start = path.points[index];
      const end = path.points[(index + 1) % path.points.length];
      const segmentLength = Math.max(segmentEnd - previousLength, 0.0001);
      const amount = (distance - previousLength) / segmentLength;
      return start.clone().lerp(end, amount);
    }

    previousLength = segmentEnd;
  }

  return path.points[0].clone();
}

function frameObject() {
  if (!state.currentObject) return;

  const size = state.currentSize;
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
  const fitWidthDistance = fitHeightDistance / Math.max(camera.aspect, 1);
  const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.18;
  const viewDirection = new THREE.Vector3(0.86, 0.58, 0.96).normalize();

  camera.near = Math.max(maxDim / 2000, 0.01);
  camera.far = maxDim * 500;
  camera.position.copy(viewDirection.multiplyScalar(distance));
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = maxDim * 0.08;
  controls.maxDistance = maxDim * 8;
  controls.update();
}

function initializeResponsivePanel() {
  const mobilePanelQuery = window.matchMedia("(max-width: 560px)");
  if (mobilePanelQuery.matches) {
    setPanelVisible(false);
  }
}

function setPanelVisible(visible) {
  state.panelVisible = visible;
  controlPanel.classList.toggle("hidden", !visible);
  const button = document.querySelector('[data-action="toggle-panel"]');
  button?.replaceChildren(createIcon(visible ? PanelRightClose : PanelRightOpen));
}

function applyMaterialMode() {
  if (!state.currentObject) return;

  state.currentObject.traverse((child) => {
    if (!child.isMesh) return;

    if (state.currentMode === "material") {
      child.material = child.userData.originalMaterial || materials.fallback;
    }

    if (state.currentMode === "white") {
      child.material = materials.white;
    }

    if (state.currentMode === "layer") {
      const seed = hashString(child.name || child.parent?.name || "mesh");
      child.material = layerMaterials[seed % layerMaterials.length];
    }
  });

  applyClipping();
}

function applyClipping() {
  if (!state.currentObject) return;
  updateClippingPlane();

  state.currentObject.traverse((child) => {
    if (!child.isMesh) return;
    applyToMaterials(child.material, (material) => {
      material.clippingPlanes = state.sectionEnabled ? [clippingPlane] : null;
      material.clipShadows = state.sectionEnabled;
      material.needsUpdate = true;
    });
  });
}

function updateClippingPlane() {
  const span = Math.max(state.currentSize.x, 1);
  const normalized = Number(sectionInput.value) / 100;
  clippingPlane.constant = (normalized - 0.5) * span;
}

function updateMetrics() {
  let meshCount = 0;
  let triangles = 0;

  state.currentObject.traverse((child) => {
    if (!child.isMesh) return;
    meshCount += 1;
    const geometry = child.geometry;
    if (geometry.index) {
      triangles += geometry.index.count / 3;
    } else if (geometry.attributes.position) {
      triangles += geometry.attributes.position.count / 3;
    }
  });

  const size = state.currentSize;
  const values = metrics.querySelectorAll("dd");
  values[0].textContent = formatNumber(meshCount);
  values[1].textContent = formatNumber(Math.round(triangles));
  values[2].textContent = `${compactLength(size.x)} x ${compactLength(size.y)} x ${compactLength(size.z)}`;
  window.__modelShowcase.meshCount = meshCount;
  window.__modelShowcase.triangles = Math.round(triangles);
}

function applyToMaterials(material, callback) {
  if (Array.isArray(material)) {
    material.forEach((item) => item && callback(item));
    return;
  }

  if (material) callback(material);
}

function resize() {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  requestAnimationFrame(animate);
  updateWalkingPerson(clock.getElapsedTime());
  controls.update();
  renderer.render(scene, camera);
}

function showLoading(title, detail = "") {
  loadingLayer.classList.remove("hidden");
  loadingTitle.textContent = title;
  loadingDetail.textContent = detail;
}

function hideLoading() {
  loadingLayer.classList.add("hidden");
}

function flash(message) {
  window.clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "--";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function compactLength(value) {
  const absolute = Math.abs(value);
  if (absolute >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (absolute >= 10) return value.toFixed(0);
  return value.toFixed(1);
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
