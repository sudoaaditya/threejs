import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import GUI from 'lil-gui';
import StarField from './StarField';

// shaders
// import vertexShader from './shaders/vertex.glsl';
// import fragmentShader from './shaders/fragment.glsl';

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
        this.starField = null;

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

        this.clock = new THREE.Clock();

        // camera & resize
        this.setupCamera();
        this.setupResize();

        // wramup calls
        this.resize();
        this.render();

        // world setup
        this.settings();
        this.loadTextures();
        this.addContents();

        // start animation loop
        this.start();
    }

    settings = () => {
        this.settings = {
            numberOfStars: 1000,
            fieldRadius: 25,
            starSize: 10,
            texture1: () => this.changeTexture(0),
            texture2: () => this.changeTexture(1),
            texture3: () => this.changeTexture(2),
            texture4: () => this.changeTexture(3),
            texture5: () => this.changeTexture(4),
            texture6: () => this.changeTexture(5),
        };

        this.gui.add(this.settings, 'numberOfStars', 100, 10000, 10).onChange(() => {
            this.scene.remove(this.starField.stars);
            this.starField.updateStarNumbers(this.settings.numberOfStars);
            this.scene.add(this.starField.stars);
        });

        this.gui.add(this.settings, 'fieldRadius', 2, 100, 1).onChange(() => {
            this.scene.remove(this.starField.stars);
            this.starField.updateFieldRadius(this.settings.fieldRadius);
            this.scene.add(this.starField.stars);
        });

        this.gui.add(this.settings, 'starSize', 1, 100, 1).onChange(() => {
            this.starField.updateStarSize(this.settings.starSize);
        });

        const texFolder = this.gui.addFolder('Textures');

        texFolder.add(this.settings, 'texture1');
        texFolder.add(this.settings, 'texture2');
        texFolder.add(this.settings, 'texture3');
        texFolder.add(this.settings, 'texture4');
        texFolder.add(this.settings, 'texture5');
        texFolder.add(this.settings, 'texture6');
    }

    changeTexture = (index) => {
        this.starField.updateStarMap(this.textures[index]);
    }

    loadTextures = () => {
        const texPaths = [
            '/textures/1.png',
            '/textures/2.png',
            '/textures/3.png',
            '/textures/4.png',
            '/textures/5.png',
            '/textures/6.png',
        ]

        this.textures = texPaths.map((path) => this.texLoader.load(path));
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

    addContents = () => {
        // render base scene data!
        this.starField = new StarField({
            starNumbers: this.settings.numberOfStars,
            starTexture: this.textures[4],
            starSize: this.settings.starSize,
            radiusOffset: this.settings.fieldRadius
        });
        this.scene.add(this.starField.stars);
    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        this.starField.update(this.elpasedTime);

        this.controls.update();

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