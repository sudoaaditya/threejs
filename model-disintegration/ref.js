import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import GUI from "lil-gui";
import gsap from "gsap";
const createInputEvents = require('simple-input-events');
import dancer from "../model000.glb";
// import matcap from '../nature_bone_dusted.png'
import matcap1 from '../skin_drmanhattan.png'
import matcap2 from '../metal_gold_buffed.png'
import matcap0 from '../nature_ice_furnace.png'
console.log(extendMaterial)
let matcaps = [matcap0, matcap1, matcap2]
let matcap = matcaps[Math.floor(Math.random() * 3)]


// console.log(THREE.extendMaterial,'asdasd')

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();
        this.group = new THREE.Group();
        this.scene.add(this.group)

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.event = createInputEvents(this.renderer.domElement);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x575757, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            0.001,
            1000
        );

        // var frustumSize = 10;
        // var aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
        this.camera.position.set(1.3, 1.3, 1.3);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;

        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath(
            "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/"
        ); // use a full url path
        this.gltf = new GLTFLoader();
        this.gltf.setDRACOLoader(this.dracoLoader);

        this.isPlaying = true;

        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
        this.addLights();
        this.settings();
        this.events()
    }

    events() {
        this.event.on('move', ({ uv }) => {
            this.settings.progress = (2 * (uv[0] - 0.5))
            this.material2.uniforms.progress.value = Math.abs(2 * (uv[0] - 0.5))
        })
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };
        // this.gui = new GUI();
        // this.gui.add(this.settings, "progress", 0, 1, 0.01).onChange((val) => {
        //   this.material2.uniforms.progress.value = val;
        // });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let floor = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 150, 100, 100),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        floor.rotation.x = -Math.PI * 0.5;
        floor.position.y = -1.1;
        this.scene.add(floor);
        floor.castShadow = false;
        floor.receiveShadow = true;
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometry = new THREE.IcosahedronGeometry(2, 10);
        this.geometry = new THREE.BoxGeometry(2, 2, 2, 10, 10, 10);
        // this.geometry = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();
        // this.geometry = new THREE.PlaneGeometry(1, 1).toNonIndexed();

        console.log(this.geometry);



        this.material2 = THREE.extendMaterial(THREE.MeshMatcapMaterial, {
            class: THREE.CustomMaterial, // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

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


        float prog = clamp((position.y + 1.12)/2.,0.,1.); 
        float locprog = clamp( (progress - 0.8*prog)/0.2, 0., 1.);
        
        // locprog = progress;


        transformed = transformed - aCenter;
        transformed +=4.*normal*aRandom*(locprog);

        transformed *=clamp((1.- locprog*9.),0.,1.);
        
        
        

        transformed += aCenter;

        // transformed+=normal*aRandom*(locprog);

        

        transformed = rotate(transformed, vec3(0.0, 1.0, 0.0), aRandom*(locprog)*3.14*4.);

        
        
        `,
            },
            fragment: {
                'vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;': 'outgoingLight =texture2D( matcap, uv ).rgb;'
            },

            uniforms: {
                roughness: 0.75,
                matcap: new THREE.TextureLoader().load(matcap),
                time: {
                    mixed: true, // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true, // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0,
                },
                progress: {
                    mixed: true, // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true, // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0,
                },
            },
        });

        // this.material2.uniforms.diffuse.value = new THREE.Color(0xff0000);
        console.log(this.material2)
        // this.material2.uniforms.map.value = new THREE.TextureLoader().load(matcap)

        this.gltf.load(dancer, (gltf) => {
            // this.dancer = gltf.scene.getObjectByName("Object_4");
            console.log(gltf)


            gltf.scene.traverse(child => {
                if (child.isMesh) {
                    let o = child.clone()


                    let s = 0.005;
                    o.geometry.scale(s, s, s)

                    this.group.add(o)

                    // console.log(o,'!!!!')

                    o.castShadow = true;

                    o.customDepthMaterial = THREE.extendMaterial(THREE.MeshDepthMaterial, {
                        template: this.material2,
                    });

                    let geometry = o.geometry.toNonIndexed();

                    geometry.computeBoundingBox()
                    console.log(geometry)

                    // o.geometry = geometry;
                    o.material = this.material2;

                    let len = geometry.attributes.position.count;
                    console.log(len, 'len', geometry)

                    let randoms = new Float32Array(len);
                    let centers = new Float32Array(len * 3);
                    for (let i = 0; i < len; i += 3) {
                        let r = Math.random();
                        randoms[i] = r;
                        randoms[i + 1] = r;
                        randoms[i + 2] = r;

                        let x = geometry.attributes.position.array[i * 3];
                        let y = geometry.attributes.position.array[i * 3 + 1];
                        let z = geometry.attributes.position.array[i * 3 + 2];

                        let x1 = geometry.attributes.position.array[i * 3 + 3];
                        let y1 = geometry.attributes.position.array[i * 3 + 4];
                        let z1 = geometry.attributes.position.array[i * 3 + 5];

                        let x2 = geometry.attributes.position.array[i * 3 + 6];
                        let y2 = geometry.attributes.position.array[i * 3 + 7];
                        let z2 = geometry.attributes.position.array[i * 3 + 8];

                        let center = new THREE.Vector3(x, y, z)
                            .add(new THREE.Vector3(x1, y1, z1))
                            .add(new THREE.Vector3(x2, y2, z2))
                            .divideScalar(3);

                        centers.set([center.x, center.y, center.z], i * 3);
                        centers.set([center.x, center.y, center.z], (i + 1) * 3);
                        centers.set([center.x, center.y, center.z], (i + 2) * 3);

                    }

                    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

                    geometry.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3));

                    o.geometry = geometry;
                }
            });
        });
        // end of everyghing
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(light1);

        const light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 3, 0.3);
        light.position.set(0, 2, 2);
        light.target.position.set(0, 0, 0);

        light.castShadow = true;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 9;
        light.shadow.bias = 0.0001;

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        this.scene.add(light);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.render();
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.04;
        this.group.rotation.y = this.settings.progress * Math.PI * 2;
        this.material2.uniforms.time.value = this.time;
        this.material.uniforms.time.value = this.time;

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

new Sketch({
    dom: document.getElementById("container"),
});
