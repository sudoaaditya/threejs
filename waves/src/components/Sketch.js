import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

//Shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

//Objects
import Obj1 from '../assets/models/ob1.glb';
import matcap from '../assets/textures/sec2.png';
import scanTex from '../assets/textures/scan.png';

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

        this.dummy = new THREE.Object3D();

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

        //setup GLTF lodaer
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/tree/dev/examples/jsm/libs/draco/')
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

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
        /* this.camera = new THREE.PerspectiveCamera(
            70,
            (window.innerWidth/window.innerHeight),
            0.001,
            1000
        ); */

        var frustumSize = 4;
        var aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(frustumSize * aspect / -2,
        frustumSize * aspect / 2, frustumSize/ 2, frustumSize / -2, -1000, 1000);

        this.camera.position.set(8, 12, 16);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxDistance = 30;
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

    addContents = async () => {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uMatcap: { value: new THREE.TextureLoader().load(matcap) },
                uScan: { value: new THREE.TextureLoader().load(scanTex) },
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    
        /* this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane); */

        let {scene: children} = await this.gltfLoader.loadAsync(Obj1);
        let geoOne = children.children[0].geometry;

        /* let mat = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load(matcap)
        }); */

        let rows = 100;
        this.count =  rows * rows;
        let index = 0;
        let random = new Float32Array(this.count);

        this.instanced = new THREE.InstancedMesh(geoOne, this.material, this.count);

        this.scene.add(this.instanced);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < rows; j++) {
                random[index] = Math.random();
                this.dummy.position.set( i - rows/2, -10, j - rows/2);
                this.dummy.updateMatrix();
                this.instanced.setMatrixAt(index++, this.dummy.matrix);
            }
        }

        this.instanced.instanceMatrix.needsUpdate = true;
        this.instanced.geometry.setAttribute('aRamdom', new THREE.InstancedBufferAttribute(random, 1)); 
    }


    update = () => {
        this.time += 0.009;
        this.material.uniforms.time.value = this.time;
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