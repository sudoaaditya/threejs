

import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

// Cloud Shader
import cloudVertexShader from './shaders/cloud/vertex.glsl';
import cloudFragmentShader from './shaders/cloud/fragment.glsl';

class Sketch {
    constructor(container) {
        // Three Vars
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        // this.controls = null;

        this.frameId = null;
        this.container = container;

        //extra vars
        this.texLoader = new THREE.TextureLoader();
        this.terrain = {};
        this.clouds = {};

        this.height = 0;
        this.width = 0;

        this.mouseX = 0;
        this.mouseY = 0;

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

        //Setup Camera & Resize
        this.setupCamera();
        this.setupResize();
        this.setupMouseMove();

        this.time = 0;

        // warmup calls
        this.resize();
        this.render();

        //Setuup world
        this.addTexture();

        //Start ANimation Loop
        this.start();
    }

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(
            35,
            (this.width / this.height),
            0.1,
            30000
        );

        this.camera.position.set(0, 0, -2)

        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enableDamping = true;
    }

    setupResize = () => {
        window.addEventListener('resize', this.resize);
    }

    setupMouseMove = () => {
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    }

    onDocumentMouseMove = (event) => {
        this.mouseX = (event.clientX - this.width / 2) * 0.25;
        this.mouseY = (event.clientY - this.height / 2) * 0.15;
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
            this.start_time = Date.now();
            this.frameId = window.requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    addTexture = () => {
        const scope = this;
        this.texLoader.load('/textures/cloud10.png', (texture) => {
            scope.cloudTexture = texture;

            scope.cloudTexture.colorSpace = THREE.SRGBColorSpace;
            scope.cloudTexture.magFilter = THREE.LinearMipMapLinearFilter;
            scope.cloudTexture.minFilter = THREE.LinearMipMapLinearFilter;
            scope.addContents();
        });

    }

    addContents = () => {
        var canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = window.innerHeight;

        var context = canvas.getContext('2d');

        var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1e4877");
        gradient.addColorStop(0.5, "#4584b4");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        this.container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        this.container.style.backgroundSize = '32px 100%';

        this.camera.position.z = 6000;

        const geometry = new THREE.BufferGeometry();

        var fog = new THREE.Fog(0x4584b4, - 100, 3000);
        this.scene.fog = fog;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: new THREE.Uniform(this.cloudTexture),
                fogColor: new THREE.Uniform(fog.color),
                fofNear: new THREE.Uniform(fog.near),
                forFar: new THREE.Uniform(fog.far)
            },
            vertexShader: cloudVertexShader,
            fragmentShader: cloudFragmentShader,
            depthWrite: false,
            depthTest: false,
            transparent: true,
            side: THREE.DoubleSide
        });

        const planeGeo = new THREE.PlaneGeometry(64, 64);
        var planeObj = new THREE.Object3D();

        const geometries = [];

        for (var i = 0; i < 10000; i++) {
            planeObj.position.x = Math.random() * 1000 - 500;
            planeObj.position.y = - Math.random() * Math.random() * 250 - 15;
            planeObj.position.z = i;
            planeObj.rotation.z = Math.random() * Math.PI;
            planeObj.scale.x = planeObj.scale.y = Math.random() * Math.random() * 1.5 + 0.7;
            planeObj.updateMatrix()

            const clonedPlaneGeo = planeGeo.clone();
            clonedPlaneGeo.applyMatrix4(planeObj.matrix);

            geometries.push(clonedPlaneGeo)
        }

        const planeGeos = BufferGeometryUtils.mergeGeometries(geometries);
        const planesMesh = new THREE.Mesh(planeGeos, material);
        // planesMesh.render = 2;

        // console.log(geometries)

        const planesMeshA = planesMesh.clone();
        planesMeshA.position.z = -10000;
        // planesMeshA.renderOrder = 1;

        this.scene.add(planesMesh);
        this.scene.add(planesMeshA);
    }


    update = () => {
        this.time = this.clock.getElapsedTime();

        let { camera, mouseX, mouseY } = this;


        const position = ((Date.now() - this.start_time) * 0.03) % 8000;

        camera.position.x += ( mouseX - camera.position.x ) * 0.01;
        camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
        camera.position.z = - position + 8000;

        // this.controls.update();
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