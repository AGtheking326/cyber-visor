import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
//import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

import { gsap } from 'gsap';
// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,alpha:true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Orbit controls
//const controls = new OrbitControls(camera, renderer.domElement);

// Postprocessing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.002; // Subtle RGB shift
composer.addPass(rgbShiftPass);

// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr',
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
   // scene.background = texture;
  },
  undefined,
  function (error) {
    console.error('An error happened while loading the HDRI:', error);
  }
);

// Load GLTF model and store it in a variable for rotation
let model = null;

const loader = new GLTFLoader();
loader.load(
  './DamagedHelmet.gltf',
  (gltf) => {
    model = gltf.scene;
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('An error happened while loading the GLTF model:', error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);


  composer.render();
}
animate();

window.addEventListener('mousemove',(e)=>{
    if(model)
    {
    const rotationX=(e.clientX/window.innerWidth-.5)*(Math.PI*0.12);
    const rotationY=(e.clientY/window.innerHeight-.5)*(Math.PI*0.12);
    gsap.to(model.rotation, { 
      y: rotationX, 
      x: rotationY, 
      duration: 0.5, 
      ease: "power2.out" 
    });

    }
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
