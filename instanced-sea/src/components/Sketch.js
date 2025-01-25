import * as THREE from 'three';
import {
    OrbitControls, RenderPass,
    ShaderPass, UnrealBloomPass,
    EffectComposer
} from 'three/examples/jsm/Addons.js';

import GUI from 'lil-gui';

// shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import noiseShaderFunc from './shaders/include/noise3d.glsl';

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

        this.textures = [];

        this.initialize();
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
        this.renderer.toneMappingExposure = Math.pow(1, 4.0);

        this.clock = new THREE.Clock();

        // camera & resize
        this.setupCamera();

        // world setup
        this.materialShaders = [];
        this.materialInst = [];
        this.darkMaterial = this.createMaterial("basic", 0x000000, 0, false);
        this.materials = {};

        this.layerNames = {
            ENTIRE_SCENE: 0,
            BLOOM_SCENE: 1
        }
        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(this.layerNames.BLOOM_SCENE);

        this.settings();
        this.loadTextures();

        this.addComposer();
        this.addLights();
        this.addContents();

        this.setupResize();

        // wramup calls
        // this.resize();
        // this.render();

        // start animation loop
        this.start();
    }

    settings = () => {
        this.params = {
            exposure: 1,
            bloomStrength: 0.9,
            bloomThreshold: 0,
            bloomRadius: 0
        };

        const bloomFolder = this.gui.addFolder("Bloom Settings")

        bloomFolder.add(this.params, "bloomThreshold", 0.0, 1.0, 0.1).onChange((value) => {
            this.bloomPass.threshold = Number(value);
        })

        bloomFolder.add(this.params, "bloomStrength", 0.0, 3.0, 0.1).onChange((value) => {
            this.bloomPass.strength = Number(value);
        })

        bloomFolder.add(this.params, "bloomRadius", 0.0, 1.0, 0.01).onChange((value) => {
            this.bloomPass.radius = Number(value);
        })

        const toneMappingFolder = this.gui.addFolder('Tone Mapping');

        toneMappingFolder.add(this.params, 'exposure', 0.5, 5).onChange((value) => {
            this.renderer.toneMappingExposure = Math.pow(value, 4.0);
        });

    }

    loadTextures = () => {
        const texPaths = []

        this.textures = texPaths.map((path) => this.texLoader.load(path));
    }

    setupCamera = () => {

        this.camera = new THREE.PerspectiveCamera(
            60,
            (this.sizes.width / this.sizes.height),
            0.1,
            1000
        );

        this.camera.position.set(0, 4, 10);

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

        this.renderer.setSize(this.sizes.width, this.sizes.height);

        this.bloomComposer.setSize(this.sizes.width, this.sizes.height);
        this.finalComposer.setSize(this.sizes.width, this.sizes.height);
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = window.requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    }

    addLights = () => {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 10, 1);
        this.scene.add(light);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    }

    addComposer = () => {
        this.renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            1.5,
            0.4,
            0.85
        );

        this.bloomPass.threshold = this.params.bloomThreshold;
        this.bloomPass.radius = this.params.bloomRadius;
        this.bloomPass.strength = this.params.bloomStrength;

        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.setSize(this.sizes.width, this.sizes.height);

        this.bloomComposer.addPass(this.renderScene);
        this.bloomComposer.addPass(this.bloomPass);


        this.finalPass = new ShaderPass(
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    baseTexture: new THREE.Uniform(null),
                    bloomTexture: new THREE.Uniform(this.bloomComposer.renderTarget2.texture)
                }
            }),
            "baseTexture"
        );

        this.finalPass.needsSwap = true;

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.setSize(this.sizes.width, this.sizes.height);

        this.finalComposer.addPass(this.renderScene);
        this.finalComposer.addPass(this.finalPass);
    }

    addContents = () => {
        // render base scene data!

        this.boxPos = new THREE.PlaneGeometry(22, 22, 99, 99);
        this.boxPos.rotateX(-Math.PI * 0.5);

        this.sphereGeom = new THREE.SphereGeometry(0.15, 16, 8);

        this.instancedGeom = new THREE.InstancedBufferGeometry();
        this.instancedGeom.attributes.position = this.sphereGeom.attributes.position;
        this.instancedGeom.attributes.normal = this.sphereGeom.attributes.normal;
        this.instancedGeom.index = this.sphereGeom.index;

        this.instancedGeom.setAttribute(
            "aInstPosition",
            new THREE.InstancedBufferAttribute(this.boxPos.attributes.position.array, 3)
        );
        this.instancedGeom.setAttribute(
            "aInstUv",
            new THREE.InstancedBufferAttribute(this.boxPos.attributes.uv.array, 2)
        );

        this.instanceOne = new THREE.Mesh(
            this.instancedGeom,
            this.createMaterial("standard", 0x222244, 0, false)
        );
        this.scene.add(this.instanceOne);

        this.instanceTwo = new THREE.Mesh(
            this.instancedGeom,
            this.createMaterial("basic", 0x6622CC, 1, true)
        );
        this.instanceTwo.layers.enable(this.layerNames.BLOOM_SCENE);
        this.scene.add(this.instanceTwo);
    }

    createMaterial = (type, color, isTip, changeColor) => {
        let mat =
            type === "basic"
                ? new THREE.MeshBasicMaterial()
                : new THREE.MeshStandardMaterial();

        mat.color.set(color);

        if (type === "standard") {
            mat.metalness = 0.25;
            mat.roughness = 0.75;
        }

        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = new THREE.Uniform(1.0);
            shader.uniforms.uIsTip = new THREE.Uniform(0.0);

            shader.vertexShader =
                ` 
            uniform float uTime;
            uniform float uIsTip;

            attribute vec3 aInstPosition;
            attribute vec2 aInstUv;
            ` + noiseShaderFunc + "\n" + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                `#include <begin_vertex>`,
                `
                vec3 transformed = vec3(position);

                vec3 ip = aInstPosition;
                vec2 iUv = aInstUv;

                iUv.y += uTime * 0.125;
                iUv *= vec2(3.14);
                float wave = snoise(vec3(iUv, 0.0));

                ip.y = wave * 3.5;

                float lim = 2.0;
                bool tip = uIsTip < 0.5 ? ip.y > lim : ip.y <= lim;
                transformed *= tip ? 0.0 : 1.0;

                transformed = transformed + ip;
                `
            );

            this.materialShaders.push({
                id: 'mat' + this.materialShaders.length,
                shader,
                isTip,
                changeColor,
            });
            this.materialInst.push(mat)
        };

        return mat;
    }

    darkenNonBloomed = (obj) => {
        if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;
        }
        this.renderer.setClearColor(0x000000);
    }

    restoreMaterial = (obj) => {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
        this.renderer.setClearColor(0x332233);
    }

    renderBloom = () => {
        this.scene.traverse(this.darkenNonBloomed);
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial);
    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        this.controls.update();

        this.render();

        this.frameId = window.requestAnimationFrame(this.update);
    }

    render = () => {
        this.materialShaders.forEach((mat, idx) => {
            const time = this.elpasedTime;
            mat.shader.uniforms.uTime.value = time * 0.5;
            mat.shader.uniforms.uIsTip.value = mat.isTip;
            if (mat.changeColor) {
                this.materialInst[idx].color.setHSL(time * 0.1 % 1.0, 0.625, 0.375);
            }
        });

        this.renderBloom();

        this.finalComposer.render();
    }
}

export { Sketch };