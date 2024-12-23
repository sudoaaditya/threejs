import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import { RenderPass, ShaderPass, EffectComposer} from 'three/examples/jsm/Addons.js';
import { CustomPass } from './CustomPass';

import GUI from 'lil-gui';

// shaders
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
    this.gui = new GUI();

    this.initialize();
    this.initPostProcessing();
  }

  initialize = () => {

    this.texLoader = new THREE.TextureLoader();

    this.scene = new THREE.Scene();

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

    // camera & resize
    this.setupCamera();
    this.setupResize();

    // wramup calls
    this.resize();
    this.render();

    // world setup
    this.loadTextures();
    this.addContents();
    this.settings()

    // start animation loop
    this.start();
  }

  initPostProcessing = () => {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.effect1 = new ShaderPass(CustomPass);
    this.composer.addPass(this.effect1);
  }

  settings = () => {
    this.settings = {
      progress: 0,
      scale: 1
    }

    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "scale", 0, 10, 0.01);
  }

  setupCamera = () => {

    this.camera = new THREE.PerspectiveCamera(
      35,
      (this.sizes.width / this.sizes.height),
      0.1,
      1000
    );

    this.camera.position.set(0, 0, 2.35);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  setupResize = () => {
    window.addEventListener('resize', this.resize);
  }


  resize = () => {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.composer && this.composer.setSize(this.sizes.width, this.sizes.height)
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
    const urls = ['/textures/vg2.jpg', '/textures/vg1.jpg', '/textures/vg3.jpg', ]
    this.textures = urls.map(url => this.texLoader.load(url));

  }

  addContents = () => {
    // render base scene data!
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: new THREE.Uniform(0),
        resolution: new THREE.Uniform(new THREE.Vector4()),
        uTexture: new THREE.Uniform(this.textures[0]),
        uvRate1: new THREE.Uniform(new THREE.Vector2(1, 1))
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    this.geometry = new THREE.PlaneGeometry(0.95, 0.65, 1, 1);
    this.meshes = [];

    this.textures.forEach((t, i) => {
      let mat = this.material.clone();
      mat.uniforms.uTexture.value = t;
      let mesh = new THREE.Mesh(this.geometry, mat);
      this.scene.add(mesh);
      this.meshes.push(mesh);
      mesh.position.x = i - 1;
    })
  }

  update = () => {
    this.elpasedTime = this.clock.getElapsedTime();

    this.meshes.forEach((mesh, i) => {
      mesh.position.y = - this.settings.progress;
      mesh.rotation.z = this.settings.progress * Math.PI / 2;
    })

    if(this.effect1) {
      this.effect1.uniforms['time'].value = this.elpasedTime;
      this.effect1.uniforms['progress'].value = this.settings.progress;
      this.effect1.uniforms['scale'].value = this.settings.scale;
    }

    this.render();

    this.frameId = window.requestAnimationFrame(this.update);
  }

  render = () => {
    const { composer} = this;
    if (composer) {
      this.composer.render()
    }
  }
}

new Sketch(document.querySelector("canvas.webgl"));