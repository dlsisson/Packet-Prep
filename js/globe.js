function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(script);
  });
}

function initCanvasFallback(container) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  container.innerHTML = "";
  container.appendChild(canvas);

  let width = 0;
  let height = 0;
  let radius = 0;
  let centerX = 0;
  let centerY = 0;
  let rotation = 0;

  function resize() {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width * 0.58;
    centerY = height * 0.5;
    radius = Math.min(width, height) * 0.28;
  }

  function projectPoint(phi, theta, rotY) {
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    const ct = Math.cos(theta);
    const st = Math.sin(theta);

    const x = cp * ct;
    const y = sp;
    const z = cp * st;

    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    const xr = x * cosR + z * sinR;
    const zr = -x * sinR + z * cosR;

    const perspective = 2.25;
    const scale = perspective / (perspective - zr * 0.9);
    return {
      x: centerX + xr * radius * scale,
      y: centerY + y * radius * scale,
      z: zr,
    };
  }

  function drawCurve(points, alpha) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = "rgba(255,242,220," + alpha.toFixed(3) + ")";
    ctx.stroke();
  }

  function drawGlobe() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.12, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,242,220,0.18)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,242,220,0.72)";
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    for (let m = 0; m < 14; m += 1) {
      const theta = (m / 14) * Math.PI * 2;
      const points = [];
      let depth = 0;
      for (let i = 0; i <= 90; i += 1) {
        const phi = -Math.PI / 2 + (i / 90) * Math.PI;
        const p = projectPoint(phi, theta, rotation);
        depth += p.z;
        points.push(p);
      }
      const alpha = 0.14 + (((depth / points.length) + 1) / 2) * 0.36;
      drawCurve(points, alpha);
    }

    for (let p = -4; p <= 4; p += 1) {
      const phi = (p / 5) * (Math.PI / 2) * 0.9;
      const points = [];
      let depth = 0;
      for (let i = 0; i <= 160; i += 1) {
        const theta = (i / 160) * Math.PI * 2;
        const pt = projectPoint(phi, theta, rotation);
        depth += pt.z;
        points.push(pt);
      }
      const alpha = 0.14 + (((depth / points.length) + 1) / 2) * 0.28;
      drawCurve(points, alpha);
    }

    ctx.restore();
  }

  function animate() {
    rotation += 0.003;
    drawGlobe();
    requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);
}

function initThreeGlobe(container) {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 2.55;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const globeGeo = new THREE.SphereGeometry(1.24, 40, 40);
  const globeMat = new THREE.MeshBasicMaterial({
    color: 0xfff2dc,
    wireframe: true,
    transparent: true,
    opacity: 0.72,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  const outerGeo = new THREE.SphereGeometry(1.42, 36, 36);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xfff2dc,
    wireframe: true,
    transparent: true,
    opacity: 0.16,
  });
  const outerSphere = new THREE.Mesh(outerGeo, outerMat);
  scene.add(outerSphere);

  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.00045;
    outerSphere.rotation.y += 0.00022;
    renderer.render(scene, camera);
  }

  function onResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  animate();
  window.addEventListener("resize", onResize);
  onResize();
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("globe-container");
  if (!container) return;

  if (typeof THREE === "undefined") {
    try {
      await loadScript("https://unpkg.com/three@0.161.0/build/three.min.js");
    } catch (e1) {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js");
      } catch (e2) {
        console.warn("Three.js unavailable, using canvas fallback globe.", e2 || e1);
        initCanvasFallback(container);
        return;
      }
    }
  }

  initThreeGlobe(container);
});