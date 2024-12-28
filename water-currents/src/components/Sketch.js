import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import GUI from 'lil-gui';

// shaders
import vertexShader from './shaders/watercurrents/vertexParticles.glsl';
import fragmentShader from './shaders/watercurrents/fragment.glsl';

import vertexTubeShader from './shaders/tubecurrents/vertex.glsl';
import fragmentTubeShader from './shaders/tubecurrents/fragment.glsl';

import vertexCausticsShader from './shaders/watercaustics/vertex.glsl';
import fragmenCausticsShader from './shaders/watercaustics/fragment.glsl';

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
        this.renderer.setClearColor(0x05233c, 1);
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

        this.camera.position.set(0, 0, 9);

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

    loadTextures = () => {
        const urls = [
            '/textures/sphere-normal.jpg',
            '/textures/dots.jpg',
            '/textures/stripes.png',
            '/textures/noise2.png'
        ];

        this.textures = urls.map(url => this.texLoader.load(url));
        this.textures.forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });
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
                uTexture: new THREE.Uniform(this.textures[0]),
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        let number = 10000;

        this.geometry = new THREE.BufferGeometry();

        this.positions = new Float32Array(number * 3);
        this.randoms = new Float32Array(number * 3);

        for (let i = 0; i < number * 3; i += 3) {
            this.positions[i + 0] = (Math.random() - 0.5);
            this.positions[i + 1] = (Math.random() - 0.5);
            this.positions[i + 2] = (Math.random() - 0.5);

            this.randoms[i + 0] = Math.random();
            this.randoms[i + 1] = Math.random();
            this.randoms[i + 2] = Math.random();

        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(this.randoms, 3));

        this.plane = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.plane);

        // water tube
        let points = [];

        for (let i = 0; i <= 100; i++) {
            const { sin, cos, PI } = Math;
            let angle = i * PI * 2 / 100;
            // trefoil knot
            let x = sin(angle) + 2.0 * sin(2.0 * angle);
            let y = cos(angle) - 2.0 * cos(2.0 * angle);
            let z = -sin(3.0 * angle);

            points.push(new THREE.Vector3(x, y, z));
        }
        let curve = new THREE.CatmullRomCurve3(points);

        this.tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.38, 100, true);

        this.tubeMaterial = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.FrontSide,
            uniforms: {
                time: new THREE.Uniform(0),
                uDotsTexture: new THREE.Uniform(this.textures[1]),
                uStripesTexture: new THREE.Uniform(this.textures[2]),
            },
            transparent: true,
            vertexShader: vertexTubeShader,
            fragmentShader: fragmentTubeShader,
        });

        this.tube = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
        this.scene.add(this.tube);

        // fake gofrays for water caustics
        let planeGeo = new THREE.PlaneGeometry(10, 10);
        this.causticsMaterial = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: new THREE.Uniform(0),
                uTexture: new THREE.Uniform(this.textures[3]),
            },
            transparent: true,
            vertexShader: vertexCausticsShader,
            fragmentShader: fragmenCausticsShader,
        });

        this.caucsticPlane = new THREE.Mesh(planeGeo, this.causticsMaterial);
        this.scene.add(this.caucsticPlane);

    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        this.material.uniforms.time.value = this.elpasedTime;
        this.tubeMaterial.uniforms.time.value = this.elpasedTime;
        this.causticsMaterial.uniforms.time.value = this.elpasedTime;

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