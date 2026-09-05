import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "images/529a47d4-0f26-43b4-ba7c-fda1400b9114 (1).glb";

for (const stage of document.querySelectorAll("[data-drone-stage]")) {
  const host = stage.querySelector("[data-drone-canvas]");
  const modelHost = stage.querySelector("[data-drone-model]");
  const headingEl = stage.querySelector("[data-drone-heading]");
  const target = stage.querySelector(".drone-target");
  if (!host || !modelHost) continue;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.15, 8.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  modelHost.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xf8eedb, 0x0b1015, 2.4));

  const key = new THREE.DirectionalLight(0xffe4aa, 4.8);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x93b5d8, 3.4);
  rim.position.set(-5, 2.5, -5);
  scene.add(rim);

  const gold = new THREE.PointLight(0xd9b86b, 8, 10, 2);
  gold.position.set(0, -1, 3);
  scene.add(gold);

  const drone = new THREE.Group();
  const modelPivot = new THREE.Group();
  drone.add(modelPivot);
  scene.add(drone);

  // The supplied asset is oriented sideways relative to the camera.
  // Keep this correction on the model only, so pointer aiming remains intuitive.
  const assetCorrection = new THREE.Group();
  assetCorrection.rotation.y = Math.PI / 2;
  modelPivot.add(assetCorrection);

  const targetWorld = new THREE.Vector3(0, 0, 0);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let loaded = false;

  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z) || 1;

      model.scale.setScalar(3.55 / maxSize);
      model.position.set(
        -center.x * model.scale.x,
        -center.y * model.scale.y,
        -center.z * model.scale.z
      );

      model.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 1.35;
          obj.material.needsUpdate = true;
        }
      });

      assetCorrection.add(model);
      loaded = true;
    },
    undefined,
    (error) => {
      console.error("Drone model failed to load", error);
      modelHost.innerHTML = '<div class="drone-error">3D FLIGHT SYSTEM OFFLINE</div>';
    }
  );

  function updatePointer(clientX, clientY) {
    const rect = host.getBoundingClientRect();
    pointer.tx = THREE.MathUtils.clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointer.ty = THREE.MathUtils.clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  }

  host.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY), { passive: true });
  host.addEventListener("pointerleave", () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const clock = new THREE.Clock();
  let lastHeading = -1;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.085;
    pointer.y += (pointer.ty - pointer.y) * 0.085;

    // Convert the cursor into a real 3D point in front of the drone.
    // This makes the aircraft visibly aim at the exact region under the cursor.
    targetWorld.set(pointer.x * 3.2, -pointer.y * 1.85, 0.35);
    const desiredYaw = Math.atan2(targetWorld.x, targetWorld.z);
    const desiredPitch = -Math.atan2(targetWorld.y, Math.hypot(targetWorld.x, targetWorld.z));

    // Asset correction means the model's visual nose tracks the same aim vector.
    const yaw = desiredYaw;
    const pitch = desiredPitch;
    drone.rotation.y += (yaw - drone.rotation.y) * 0.105;
    drone.rotation.x += (pitch - drone.rotation.x) * 0.105;
    drone.rotation.z += ((-pointer.x * 0.075) - drone.rotation.z) * 0.08;

    // Subtle hover — never enough to fight the pointer interaction.
    drone.position.y = Math.sin(t * 1.45) * 0.075;
    drone.position.x = Math.sin(t * 0.7) * 0.025;

    if (target) {
      target.style.setProperty("--target-x", `${pointer.x * 105}px`);
      target.style.setProperty("--target-y", `${pointer.y * 82}px`);
    }

    if (headingEl) {
      const degrees = Math.round((THREE.MathUtils.radToDeg(yaw) + 360) % 360);
      if (degrees !== lastHeading) {
        headingEl.textContent = `${String(degrees).padStart(3, "0")}°`;
        lastHeading = degrees;
      }
    }

    // Slightly brighten the key light as the pointer moves, adding a physical response.
    gold.intensity = 7.2 + Math.abs(pointer.x) * 2.0 + Math.abs(pointer.y) * 1.1;
    if (loaded) renderer.render(scene, camera);
  }

  animate();
}
