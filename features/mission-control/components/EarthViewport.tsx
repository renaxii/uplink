"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { cn } from "@/lib/utils";

export type VisualSatellite = {
  name: string;
  catalogId: string;
  altitude: number;
  inclination: number;
  raan: number;
  phase: number;
  speed: number;
  color: string;
  epoch: string | null;
};

const EARTH_RADIUS = 1.72;

function createEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const ocean = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  ocean.addColorStop(0, "#081b33");
  ocean.addColorStop(0.4, "#0b3152");
  ocean.addColorStop(0.72, "#0a243f");
  ocean.addColorStop(1, "#061527");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.42;
  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.4 + 0.3;
    ctx.fillStyle = i % 4 === 0 ? "#2b6b8f" : "#164263";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const landGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  landGradient.addColorStop(0, "#315f55");
  landGradient.addColorStop(0.44, "#54715b");
  landGradient.addColorStop(1, "#244d4d");

  const drawLand = (points: Array<[number, number]>) => {
    ctx.fillStyle = landGradient;
    ctx.strokeStyle = "rgba(210, 235, 225, 0.2)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach(([x, y], index) => {
      const px = x * canvas.width;
      const py = y * canvas.height;
      if (index === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  drawLand([
    [0.16, 0.3],
    [0.24, 0.22],
    [0.31, 0.33],
    [0.29, 0.47],
    [0.23, 0.52],
    [0.18, 0.43],
  ]);
  drawLand([
    [0.28, 0.52],
    [0.35, 0.58],
    [0.33, 0.77],
    [0.28, 0.88],
    [0.24, 0.72],
  ]);
  drawLand([
    [0.47, 0.27],
    [0.61, 0.22],
    [0.73, 0.34],
    [0.69, 0.48],
    [0.56, 0.46],
    [0.48, 0.39],
  ]);
  drawLand([
    [0.53, 0.48],
    [0.62, 0.51],
    [0.66, 0.72],
    [0.58, 0.83],
    [0.51, 0.65],
  ]);
  drawLand([
    [0.72, 0.56],
    [0.82, 0.61],
    [0.86, 0.74],
    [0.78, 0.8],
  ]);

  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.fillRect(0, 0, canvas.width, 34);
  ctx.fillRect(0, canvas.height - 42, canvas.width, 42);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 260; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rx = 18 + Math.random() * 86;
    const ry = 4 + Math.random() * 22;
    const alpha = 0.03 + Math.random() * 0.12;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function createStarField() {
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const radius = 26 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const index = i * 3;

    positions[index] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index + 1] = radius * Math.cos(phi);
    positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);

    color.set(Math.random() > 0.84 ? "#8be9ff" : "#ffffff");
    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.034,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

function createAtmosphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.045, 96, 96),
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.55, 0.91, 1.0, intensity * 0.56);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    }),
  );
}

function createOrbitLine(radius: number, inclination: number, raan: number) {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= 256; i += 1) {
    const angle = (i / 256) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: "#8be9ff",
    transparent: true,
    opacity: 0.24,
  });
  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.x = inclination;
  orbit.rotation.z = raan;
  return orbit;
}

function createSatellite(config: VisualSatellite) {
  const satellite = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.075, 0.13),
    new THREE.MeshStandardMaterial({
      color: "#dbeafe",
      metalness: 0.72,
      roughness: 0.32,
    }),
  );

  const panels = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.012, 0.09),
    new THREE.MeshStandardMaterial({
      color: "#184e77",
      emissive: "#0f2f4b",
      emissiveIntensity: 0.45,
      metalness: 0.2,
      roughness: 0.38,
    }),
  );

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 16, 16),
    new THREE.MeshBasicMaterial({ color: config.color }),
  );
  beacon.position.set(0.07, 0.04, 0.06);

  const labelElement = document.createElement("div");
  labelElement.className = "satellite-label";
  labelElement.textContent = `${config.name} / ${config.catalogId}`;

  const label = new CSS2DObject(labelElement);
  label.position.set(0.13, 0.09, 0);

  satellite.add(body, panels, beacon, label);
  satellite.userData = config;

  return satellite;
}

function placeSatellite(satellite: THREE.Group, config: VisualSatellite, elapsed: number) {
  const angle = elapsed * config.speed + config.phase;
  const orbitTilt = new THREE.Euler(config.inclination, 0, config.raan, "XYZ");
  const position = new THREE.Vector3(
    Math.cos(angle) * config.altitude,
    0,
    Math.sin(angle) * config.altitude,
  ).applyEuler(orbitTilt);

  satellite.position.copy(position);
  satellite.lookAt(0, 0, 0);
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

export function EarthViewport({
  className,
  satellites = [],
}: {
  className?: string;
  satellites?: VisualSatellite[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#020817", 0.025);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
    camera.position.set(0, 1.15, 6.15);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#020817", 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.className = "satellite-label-layer";
    container.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 4.2;
    controls.maxDistance = 8.4;
    controls.rotateSpeed = 0.36;
    controls.zoomSpeed = 0.55;

    const earthTexture = createEarthTexture();
    const cloudTexture = createCloudTexture();

    const earthGroup = new THREE.Group();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 128, 128),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        color: "#dff8ff",
        metalness: 0.02,
        roughness: 0.82,
      }),
    );

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 96, 96),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
      }),
    );

    earthGroup.add(earth, clouds);
    scene.add(earthGroup);
    scene.add(createAtmosphere());

    const starField = createStarField();
    scene.add(starField);

    const orbitLines = satellites.map((satellite) =>
      createOrbitLine(satellite.altitude, satellite.inclination, satellite.raan),
    );
    orbitLines.forEach((orbit) => scene.add(orbit));

    const satelliteObjects = satellites.map(createSatellite);
    satelliteObjects.forEach((satellite) => scene.add(satellite));

    scene.add(new THREE.AmbientLight("#9cc8dc", 0.8));

    const sunLight = new THREE.DirectionalLight("#ffffff", 3.2);
    sunLight.position.set(5, 3.5, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight("#8be9ff", 1.2);
    rimLight.position.set(-4, 1.8, -3);
    scene.add(rimLight);

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    let animationFrame = 0;
    let isVisible = document.visibilityState === "visible";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const animate = () => {
      const elapsed = (performance.now() - startedAt) / 1000;

      if (isVisible) {
        if (!prefersReducedMotion) {
          earthGroup.rotation.y = elapsed * 0.045;
          clouds.rotation.y = elapsed * 0.057;
          starField.rotation.y = elapsed * 0.002;
        }

        satelliteObjects.forEach((satellite, index) => {
          placeSatellite(satellite, satellites[index], prefersReducedMotion ? 0 : elapsed);
        });

        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      }

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      controls.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      disposeObject(scene);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(labelRenderer.domElement);
    };
  }, [satellites]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-[340px] w-full overflow-hidden bg-[#020817] shadow-[inset_0_0_90px_rgba(139,233,255,0.08)]",
        className,
      )}
      aria-label="Interactive 3D Earth operations view with orbiting satellites"
    />
  );
}
