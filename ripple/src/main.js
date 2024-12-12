import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class Sketch {

  constructor(container) {

    this.container = container;

    // threejs vars
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;

    this.sizes = {};
    this.frameId = null;
    this.clock = null;

    // vars
    this.max = 100;
    this.brushMeshes = [];
    this.mouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();
    this.currentRipple = 0;

    this.initialize();
  }

  initialize = () => {

    this.texLoader = new THREE.TextureLoader();

    this.scene = new THREE.Scene();
    this.sceneOne = new THREE.Scene();

    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.container
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.clock = new THREE.Clock();

    this.baseTexture = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }
    )

    // camera & resize
    this.setupCamera();
    this.setupResize();

    // wramup calls
    this.resize();
    this.render();

    // world setup
    this.loadTextures();
    this.addContents();
    this.setupMouseMove();

    // start animation loop
    this.start();
  }

  setupCamera = () => {

    this.camera = new THREE.OrthographicCamera(
      -this.sizes.width / 2, this.sizes.width / 2,
      this.sizes.height / 2, -this.sizes.height / 2,
      -1000, 1000
    )

    this.camera.position.set(0, 0, 2);

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  setupResize = () => {
    window.addEventListener('resize', this.resize);
  }

  setupMouseMove = () => {
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
  }

  onDocumentMouseMove = (e) => {
    this.mouse.set(e.clientX - this.sizes.width / 2, this.sizes.height / 2 - e.clientY);
  }

  resize = () => {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.renderer.setSize(this.sizes.width, this.sizes.height)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = window.requestAnimationFrame(this.update);
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId);
  }

  loadTextures = () => {
    this.brush = this.texLoader.load('/textures/brush.png');
    this.beach = this.texLoader.load('/textures/beach.jpg');
  }

  addContents = () => {
    // render base scene data!

    this.brushGeo = new THREE.PlaneGeometry(64, 64, 1, 1);

    for (var i = 0; i < this.max; i++) {
      let material = new THREE.MeshBasicMaterial({
        map: this.brush,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false
      });

      let brushMesh = new THREE.Mesh(
        this.brushGeo,
        material
      )
      brushMesh.visible = false;
      brushMesh.rotation.z = 2 * Math.PI * Math.random();

      this.scene.add(brushMesh);
      this.brushMeshes.push(brushMesh)
    }

    // mesh plane
    this.baseMaterial = new THREE.ShaderMaterial({
      vertexShader, 
      fragmentShader,
      uniforms: {
        uTexture: new THREE.Uniform(this.beach),
        uDiffuse: new THREE.Uniform(this.baseTexture.texture)
      }
    })
    this.baseGeometry = new THREE.PlaneGeometry(this.sizes.width, this.sizes.height, 32, 32);
    this.baseMesh = new THREE.Mesh(
      this.baseGeometry, 
      this.baseMaterial
    )
    this.sceneOne.add(this.baseMesh);
  }

  setWave = (x, y, index) => {
    const mesh = this.brushMeshes[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.material.opacity = 0.5;
    mesh.scale.y = mesh.scale.x = 0.2;
  }

  trackMouse = () => {
    if (this.prevMouse.distanceTo(this.mouse) > 4) {
      this.setWave(this.mouse.x, this.mouse.y, this.currentRipple);
      this.currentRipple = (this.currentRipple + 1) % this.max;
    }
    this.prevMouse.copy(this.mouse);
  }

  update = () => {
    this.elpasedTime = this.clock.getElapsedTime();

    this.trackMouse()

    this.render();

    this.brushMeshes.forEach(mesh => {
      if (mesh.visible) {
        mesh.rotation.z += 0.02;
        mesh.material.opacity *= 0.96;
        mesh.scale.y = mesh.scale.x = 0.982 * mesh.scale.x + 0.108;

        if(mesh.material.opacity < 0.002) {
          mesh.visible = false;
        }
      }
    })

    this.frameId = window.requestAnimationFrame(this.update);
  }

  render = () => {
    const { renderer, camera, scene, sceneOne, baseTexture, baseMaterial } = this;
    if (renderer) {
      renderer.setRenderTarget(baseTexture);
      renderer.render(scene, camera);
      baseMaterial && (baseMaterial.uniforms.uDiffuse.value = this.baseTexture.texture);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(sceneOne, camera);
    }
  }
}

new Sketch(document.querySelector("canvas.webgl"));