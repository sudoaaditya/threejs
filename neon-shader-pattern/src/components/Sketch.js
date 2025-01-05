import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';

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
        // this.controls = null;

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
        this.settings()
        this.addContents();

        // start animation loop
        this.start();
    }

    // Palette COlor Website: http://dev.thi.ng/gradients/
    settings = () => {
        this.settings = {
            iterations: 4,
            baseColorA: '#808080',
            baseColorB: '#808080',
            baseColorC: '#ffffff',
            baseColorD: '#436a8e',
            thickness: 10.0,
            uFractMultiplier: 1.5,
        };

        this.gui.add(this.settings, 'iterations', 1, 10, 1).onChange(() => {
            this.material.uniforms.uColorLoopCounter.value = this.settings.iterations;
        });

        this.gui.add(this.settings, 'thickness', 1, 20, 0.5).onChange(() => {
            this.material.uniforms.uThickness.value = this.settings.thickness;
        });

        this.gui.add(this.settings, 'uFractMultiplier', 0.5, 4, 0.1).onChange(() => {
            this.material.uniforms.uFractValue.value = this.settings.uFractMultiplier;
        });

        this.paletteFolder = this.gui.addFolder("PaletteColors");
        this.paletteFolder.addColor(this.settings, 'baseColorA').onChange(() => {
            this.material.uniforms.uColorA.value = new THREE.Color(this.settings.baseColorA);
        });
        this.paletteFolder.addColor(this.settings, 'baseColorB').onChange(() => {
            this.material.uniforms.uColorB.value = new THREE.Color(this.settings.baseColorB);
        });
        this.paletteFolder.addColor(this.settings, 'baseColorC').onChange(() => {
            this.material.uniforms.uColorC.value = new THREE.Color(this.settings.baseColorC);
        });
        this.paletteFolder.addColor(this.settings, 'baseColorD').onChange(() => {
            this.material.uniforms.uColorD.value = new THREE.Color(this.settings.baseColorD);
        });
    }

    setupCamera = () => {

        this.camera = new THREE.PerspectiveCamera(
            35,
            (this.sizes.width / this.sizes.height),
            0.1,
            1000
        );

        this.camera.position.set(0, 0, 4);

        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
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

        this.setPlaneScaleToFitTheWindow();
        this.material?.uniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
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
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: new THREE.Uniform(0),
                uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width, this.sizes.height)),
                uColorLoopCounter: new THREE.Uniform(this.settings.iterations),
                uColorA: new THREE.Uniform(new THREE.Color(this.settings.baseColorA)),
                uColorB: new THREE.Uniform(new THREE.Color(this.settings.baseColorB)),
                uColorC: new THREE.Uniform(new THREE.Color(this.settings.baseColorC)),
                uColorD: new THREE.Uniform(new THREE.Color(this.settings.baseColorD)),
                uThickness: new THREE.Uniform(10.0),
                uFractValue: new THREE.Uniform(1.5),
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        console.log(this.material.uniforms);
        

        this.geometry = new THREE.PlaneGeometry(1, 1);

        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);

        this.setPlaneScaleToFitTheWindow();
    }

    setPlaneScaleToFitTheWindow = () => {
        const distance = this.camera.position.z; 
        const fovRadians = (this.camera.fov * Math.PI) / 180; 
        const visibleHeight = 2 * Math.tan(fovRadians / 2) * distance; 
        const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight); 
        
        // Scale the plane
        this.plane?.scale.set(visibleWidth, visibleHeight, 1);
    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        this.material.uniforms.time.value = this.elpasedTime;

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