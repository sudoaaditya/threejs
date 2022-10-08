import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//Shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class Sketch {
    constructor(container) {
        // Three Vars
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.frameId = null;
        this.container = container;

        this.height = 0;
        this.width = 0;

        this.initialize();
    }

    initialize = () => {
        this.scene = new THREE.Scene();

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor('#eeeeee', 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        //Setup Camera & Resize
        this.setupCamera();
        this.setupResize();

        this.time = 0;

        // warmup calls
        this.resize();
        this.render();

        //Setuup world
        this.addContents();

        //Start ANimation Loop
        this.start();
    }

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(
            70,
            (window.innerWidth/window.innerHeight),
            0.001,
            1000
        );

        this.camera.position.set(0, 0, 2);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    setupResize = () => {
        window.addEventListener('resize', this.resize);
    }

    resize = () => {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    start = () => {
        // if already initalized then leave it be
        if(!this.frameId) {
            this.frameId = requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    addContents = () => {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
                },
                side: THREE.DoubleSide,
                uniforms: {
                time: { type: "f", value: 0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
                },
                // wireframe: true,
                // transparent: true,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
        
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
    }


    update = () => {
        this.time += 0.05;

        this.controls.update();
        this.render();

        this.frameId = window.requestAnimationFrame(this.update);
    }

    render = () => {
        let { renderer, scene, camera, } = this;
        if(renderer) {
            renderer.render(scene, camera);
        }
    }
}

export default Sketch;