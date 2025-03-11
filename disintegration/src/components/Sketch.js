import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from "lil-gui";
import VirtualScroll from 'virtual-scroll'

//Shaders
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

import { extendMaterial, CustomMaterial } from './extend.js';

console.log(extendMaterial);

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

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor('#eeeeee', 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.container.appendChild(this.renderer.domElement);

        //Setup Camera & Resize
        this.setupCamera();
        this.setupResize();

        this.time = 0;

        // warmup calls
        this.resize();
        this.render();

        //Setuup world
        this.setupSettings();
        this.addContents();
        this.addLights();

        //Start ANimation Loop
        this.start();
    }

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(
            70,
            (window.innerWidth / window.innerHeight),
            0.001,
            1000
        );

        this.camera.position.set(2, 2, 2);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
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
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.update);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    setupSettings = () => {
        this.settings = {
            progress: 0,
            speedValue: 0.05
        };
        this.gui = new GUI();
        this.gui.add(this.settings, "speedValue", 0, 0.1, 0.01).onChange((val) => {
            this.settings.speedValue = val;
        });
        const scroller = new VirtualScroll()
        scroller.on(event => {
            console.log(event.deltaY);
            this.settings.progress += event.deltaY < 0 ? (-1 * this.settings.speedValue) : this.settings.speedValue;
            if (this.settings.progress >= 1) {
                this.settings.progress = 1;
            } else if (this.settings.progress <= 0) {
                this.settings.progress = 0;
            }

            this.material2.uniforms.progress.value = this.settings.progress;
        })
    }

    addContents = () => {

        //Floot
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 15, 100, 100),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );

        floor.rotation.x = - Math.PI * 0.5;
        floor.position.y = -1.5;
        floor.castShadow = false;
        floor.receiveShadow = true;
        this.scene.add(floor);

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
            wireframe: true,
            // transparent: true,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        this.geometry = new THREE.IcosahedronGeometry(1, 9, 9);
        // this.geometry = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();

        const len = this.geometry.attributes.position.count;
        let randoms = new Float32Array(len);
        let centers = new Float32Array(len * 3);

        for (let i = 0; i < len; i += 3) {
            const r = Math.random();
            randoms[i] = r;
            randoms[i + 1] = r;
            randoms[i + 2] = r;

            let x = this.geometry.attributes.position.array[i * 3];
            let y = this.geometry.attributes.position.array[i * 3 + 1];
            let z = this.geometry.attributes.position.array[i * 3 + 2];

            let x1 = this.geometry.attributes.position.array[i * 3 + 3];
            let y1 = this.geometry.attributes.position.array[i * 3 + 4];
            let z1 = this.geometry.attributes.position.array[i * 3 + 5];

            let x2 = this.geometry.attributes.position.array[i * 3 + 6];
            let y2 = this.geometry.attributes.position.array[i * 3 + 7];
            let z2 = this.geometry.attributes.position.array[i * 3 + 8];

            let center = new THREE.Vector3(x, y, z).add(new THREE.Vector3(x1, y1, z1)).add(new THREE.Vector3(x2, y2, z2)).divideScalar(3);

            centers.set([center.x, center.y, center.z], i * 3);
            centers.set([center.x, center.y, center.z], (i + 1) * 3);
            centers.set([center.x, center.y, center.z], (i + 2) * 3);
        }

        this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
        this.geometry.setAttribute('aCenter', new THREE.BufferAttribute(centers, 3));

        this.material2 = extendMaterial(THREE.MeshStandardMaterial, {

            class: CustomMaterial,  // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

            vertexHeader: `
                attribute float aRandom;
                attribute vec3 aCenter;
                uniform float time;
                uniform float progress;

                mat4 rotationMatrix(vec3 axis, float angle) {
                    axis = normalize(axis);
                    float s = sin(angle);
                    float c = cos(angle);
                    float oc = 1.0 - c;
                    
                    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                                0.0,                                0.0,                                0.0,                                1.0);
                }
                
                vec3 rotate(vec3 v, vec3 axis, float angle) {
                    mat4 m = rotationMatrix(axis, angle);
                    return (m * vec4(v, 1.0)).xyz;
                }
            `,
            vertex: {
                transformEnd: `

                    // transformed += progress * aRandom * normal;
                    // transformed = (transformed - aCenter) * progress + aCenter;

                    float prog = (position.x + 1.0)/2.0;
                    float localProg = clamp((progress - 0.6 * prog)/0.4, 0.0, 1.0);

                    transformed = transformed - aCenter;
                    transformed += normal * aRandom * localProg;
                    transformed *= (1.0 - localProg);
                    transformed += aCenter;
                    transformed = rotate(transformed, vec3(0.0, 1.0, 0.0), aRandom * localProg * 3.14 * 1.0); 

                `
            },

            uniforms: {
                roughness: 0.75,
                time: {
                    mixed: true,    // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true,   // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0
                },
                progress: {
                    mixed: true,    // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true,   // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0
                }
            }

        });

        this.material2.uniforms.diffuse.value = new THREE.Color(0xff0000);

        this.plane = new THREE.Mesh(this.geometry, this.material2);

        this.plane.customDepthMaterial = extendMaterial(THREE.MeshDepthMaterial, {
            template: this.material2
        })
        this.plane.castShadow = this.plane.receiveShadow = true;
        this.scene.add(this.plane);
    }

    addLights = () => {
        const light1 = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(light1);

        /* const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        light2.position.set(0.5, 0, 0.866) //60deg
        this.scene.add(light2); */

        const light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 5, 0.3);
        light.position.set(0, 2, 2);
        light.target.position.set(0, 0, 0);

        light.castShadow = true;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 10;
        light.shadow.bias = 0.0001;

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        this.scene.add(light);
    }


    update = () => {
        this.time += 0.04;
        this.material.uniforms.time.value = this.time;
        this.material2.uniforms.time.value = this.time;

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

export default Sketch;