import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// Cloud Shaders
import cloudVertexShader from './shaders/clouds/vertex.glsl';
import cloudFragmentShader from './shaders/clouds/fragment.glsl';

class Clouds {
    constructor(scene) {
        this.scene = scene;
        // this.sizes = sizes;

        this.textures = {};

        this.texLoader = new THREE.TextureLoader();

        this.loadTextures();
        this.createMesh();
        
    }

    loadTextures = () => {
        this.textures.cloudTexture = this.texLoader.load('/textures/cloud10/png');
        this.textures.cloudTexture.colorSpace = THREE.SRGBColorSpace;
        this.textures.cloudTexture.wrapS = this.textures.cloudTexture.wrapT = THREE.LinearMipMapLinearFilter;
    }

    createMesh = () => {
        this.geometry = new THREE.BufferGeometry();

        this.fog = new THREE.Fog(0x4584b4, - 10, 300);
        this.scene.fog = this.fog;

        this.uniforms = {
            uCloudTexture: new THREE.Uniform(this.textures.cloudTexture),
            uFogColor: new THREE.Uniform(this.fog.color),
            uFogNear: new THREE.Uniform(this.fog.near),
            uFogFar: new THREE.Uniform(this.fog.far)
        }

        this.material = new THREE.ShaderMaterial({
            vertexShader: cloudVertexShader,
            fragmentShader: cloudFragmentShader,
            uniforms: this.uniforms,
            depthWrite: false,
            depthTest: false,
            transparent: true
        })

        const planeGeometry = new THREE.PlaneGeometry(64, 64);
        const planeObject = new THREE.Object3D();

        const geometries = [];

        for(let i = 0; i < 8000; i++) {
            planeObject.position.x = Math.random() * 1000 - 500;
            planeObject.position.y = - Math.random() * Math.random() * 200 - 15;
            planeObject.position.z = i;

            planeObject.rotation.z = Math.random() * Math.PI;
            planeObject.scale.x = planeObject.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
            planeObject.updateMatrix();

            const clonedCloudGeometry = planeGeometry.clone();
            clonedCloudGeometry.applyMatrix4(planeObject.matrix);

            geometries.push(clonedCloudGeometry);

        }

        this.geometry = BufferGeometryUtils.mergeGeometries(geometries);

        this.cloudMesh = new THREE.Mesh(this.geometry, this.material);
        this.cloudMesh.renderOrder = 2;

        this.cloudMeshA = this.cloudMesh.clone();;
        this.cloudMeshA.renderOrder = 1;

        console.log(this.cloudMesh);

        this.scene.add(this.cloudMesh);
        this.scene.add(this.cloudMeshA);
    }
    
}

export { Clouds }