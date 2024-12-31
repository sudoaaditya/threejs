import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

// import GUI from 'lil-gui';

// shaders
import vertexSamplerShader from './shaders/samplers/vertex.glsl';
import fragmentSamplerShader from './shaders/samplers/fragment.glsl';

import vertexSunShader from './shaders/sun/vertex.glsl';
import fragmentSunShader from './shaders/sun/fragment.glsl';

import vertexSurroundingShader from './shaders/surrounding/vertex.glsl';
import fragmentSurroundingShader from './shaders/surrounding/fragment.glsl';

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
        // this.gui = new GUI();

        this.initialize();
    }

    initialize = () => {

        this.texLoader = new THREE.TextureLoader();

        this.scene = new THREE.Scene();
        this.sceneSun = new THREE.Scene(); // render sun here and sample ti as texture in main scene

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
        this.addSurrounding();
        this.loadSampler();
        this.addContents();
        // this.settings()

        // start animation loop
        this.start();
    }

    settings = () => {
        this.settings = {
            progress: 0,
            scale: 1
        };
    }

    setupCamera = () => {

        this.camera = new THREE.PerspectiveCamera(
            35,
            (this.sizes.width / this.sizes.height),
            0.1,
            1000
        );

        this.camera.position.set(0, 0, 4);

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
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = window.requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    }

    loadSampler = () => {

        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            colorSpace: THREE.SRGBColorSpace,
        })

        this.cubeCamera = new THREE.CubeCamera(0.1, 10, this.cubeRenderTarget);

        this.materialPerlin = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: new THREE.Uniform(0),
            },
            vertexShader: vertexSamplerShader,
            fragmentShader: fragmentSamplerShader,
        });

        this.samplerGeometry = new THREE.SphereGeometry(1, 32, 32);

        this.samplerSun = new THREE.Mesh(this.samplerGeometry, this.materialPerlin);
        this.sceneSun.add(this.samplerSun);

    }

    
    addSurrounding = () => {
        this.materialSurrounding = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.BackSide,
            uniforms: {
                time: new THREE.Uniform(0),
                uPerlin: new THREE.Uniform(null),
            },
            vertexShader: vertexSurroundingShader,
            fragmentShader: fragmentSurroundingShader,
            transparent: true
        });

        this.geometrySurrounding = new THREE.SphereGeometry(1.2, 32, 32);

        this.sunA = new THREE.Mesh(this.geometrySurrounding, this.materialSurrounding);
        this.scene.add(this.sunA);
    }

    addContents = () => {
        // render base scene data!
        this.materialSun = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: new THREE.Uniform(0),
                uPerlin: new THREE.Uniform(null),
            },
            vertexShader: vertexSunShader,
            fragmentShader: fragmentSunShader,
        });

        this.geometry = new THREE.SphereGeometry(1, 32, 32);

        this.sun = new THREE.Mesh(this.geometry, this.materialSun);
        this.scene.add(this.sun);

    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        this.materialSun.uniforms.time.value = this.elpasedTime;
        this.materialSurrounding.uniforms.time.value = this.elpasedTime;
        this.materialPerlin.uniforms.time.value = this.elpasedTime;

        this.cubeCamera.update(this.renderer, this.sceneSun);

        this.materialSun.uniforms.uPerlin.value = this.cubeRenderTarget.texture;

        this.render();

        this.frameId = window.requestAnimationFrame(this.update);
    }

    render = () => {
        let { renderer, scene, camera, } = this;
        if (renderer) {
            renderer.render(scene, camera);
        }
    }
}

export { Sketch };