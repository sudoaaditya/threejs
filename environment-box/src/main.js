
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

import { Terrain } from './Terrain';
import { Clouds } from './coulds';

class Sketch {
    constructor(container) {
        // Three Vars
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.frameId = null;
        this.container = container;

        //extra vars
        this.terrain = {};
        this.clouds = {};

        this.height = 0;
        this.width = 0;

        this.initialize();
    }

    initialize = () => {
        this.scene = new THREE.Scene();

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.container, antialias: false, gammaOutput: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor('#1e4877', 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.clock = new THREE.Clock();


        this.rgbeLoader = new RGBELoader()

        //Setup Camera & Resize
        this.setupCamera();
        this.setupResize();

        this.time = 0;

        // warmup calls
        this.resize();
        this.render();

        //Setuup world
        this.addLights();
        this.addContents();

        //Start ANimation Loop
        this.start();
    }

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(
            35,
            (this.width / this.height),
            0.1,
            100
        );

        this.camera.position.set(-10, 6, -2)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
    }

    setupResize = () => {
        window.addEventListener('resize', this.resize);
    }

    resize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    start = () => {
        // if already initalized then leave it be
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    addLights = () => {
        this.rgbeLoader.load('/hdrs/spruit_sunrise.hdr', (environmentMap) => {
            environmentMap.mapping = THREE.EquirectangularReflectionMapping

            this.scene.background = environmentMap
            this.scene.backgroundBlurriness = 0.5
            this.scene.environment = environmentMap
        })

        const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
        directionalLight.position.set(6.25, 3, 4)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.near = 0.1
        directionalLight.shadow.camera.far = 30
        directionalLight.shadow.camera.top = 8
        directionalLight.shadow.camera.right = 8
        directionalLight.shadow.camera.bottom = -8
        directionalLight.shadow.camera.left = -8
        this.scene.add(directionalLight)
    }

    addContents = () => {
        this.terrain = new Terrain(this.scene)
        this.clouds = new Clouds(this.scene);

        console.log(this.scene.children);
    }


    update = () => {
        this.time = this.clock.getElapsedTime();

        this.terrain.update(this.time);

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

new Sketch(document.querySelector('canvas.webgl'))