import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "images/529a47d4-0f26-43b4-ba7c-fda1400b9114 (1).glb";
const stages = document.querySelectorAll("[data-drone-stage]");

stages.forEach(stage => {
  const host = stage.querySelector("[data-drone-canvas]");
  const modelHost = stage.querySelector("[data-drone-model]");
  const heading = stage.querySelector("[data-drone-heading]");
  if (!host || !modelHost) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 1.0, 8.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  modelHost.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xf4ead5, 0x11161c, 2.1);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffe6ae, 4.4);
  key.position.set(4, 6, 5); key.castShadow = true; scene.add(key);
  const rim = new THREE.DirectionalLight(0x8ca9c7, 3.1);
  rim.position.set(-5, 3, -4); scene.add(rim);
  const fill = new THREE.PointLight(0xd9b86b, 7, 9, 2);
  fill.position.set(0, -1, 3); scene.add(fill);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), new THREE.MeshBasicMaterial({ color: 0xd9b86b, transparent: true, opacity: .06 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.55; scene.add(floor);

  const grid = new THREE.GridHelper(12, 24, 0x9d8757, 0x4b463d);
  grid.position.y = -1.58; grid.material.transparent = true; grid.material.opacity = .12; scene.add(grid);

  const drone = new THREE.Group();
  scene.add(drone);
  let loaded = false;
  let baseYaw = 0;
  let basePitch = 0;

  new GLTFLoader().load(MODEL_URL, gltf => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(3.7 / max);
    model.position.set(-center.x * model.scale.x, -center.y * model.scale.y, -center.z * model.scale.z);
    model.traverse(obj => {
      if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; if (obj.material) obj.material.envMapIntensity = 1.25; }
    });
    drone.add(model);
    // The supplied asset's forward-facing camera axis is offset; this keeps its nose aimed at the pointer.
    baseYaw = Math.PI / 2;
    basePitch = 0;
    loaded = true;
  }, undefined, err => {
    modelHost.innerHTML = '<div style="display:grid;place-items:center;height:100%;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:rgba(255,255,255,.35)">3D FLIGHT SYSTEM OFFLINE</div>';
    console.error("Drone model failed to load", err);
  });

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = e => {
    const r = host.getBoundingClientRect();
    pointer.tx = THREE.MathUtils.clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
    pointer.ty = THREE.MathUtils.clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
  };
  const reset = () => { pointer.tx = 0; pointer.ty = 0; };
  host.addEventListener("pointermove", onPointer);
  host.addEventListener("pointerleave", reset);

  const clock = new THREE.Clock();
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();

  const tick = () => {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.075;
    pointer.y += (pointer.ty - pointer.y) * 0.075;
    const targetYaw = baseYaw + pointer.x * 0.78;
    const targetPitch = basePitch + pointer.y * 0.34;
    drone.rotation.y += (targetYaw - drone.rotation.y) * 0.09;
    drone.rotation.x += (targetPitch - drone.rotation.x) * 0.09;
    drone.position.y = Math.sin(t * 1.3) * 0.08;
    drone.rotation.z = Math.sin(t * .8) * .025 - pointer.x * .045;
    const heading = ((targetYaw - baseYaw) * 180 / Math.PI + 360) % 360;
    if (heading !== undefined && heading != null) headingEl(heading);
    const target = host.querySelector(".drone-target");
    if (target) target.style.transform = `translate(calc(-50% + ${pointer.x * 75}px), calc(-50% + ${pointer.y * 65}px))`;
    renderer.render(scene, camera);
  };
  const headingEl = value => { if (heading) heading.textContent = `${String(Math.round(value)).padStart(3, "0")}°`; };
  tick();
});
