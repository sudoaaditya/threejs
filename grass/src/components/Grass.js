
import * as THREE from 'three';
import { getAttributeData, getYPosition } from './utils/AttributesHelper';

import vertexShader from './shaders/grass/vertex.glsl';
import fragmentShader from './shaders/grass/fragment.glsl';

class Grass {
    constructor(options, width, instances) {
        this.options = options || {bW: 0.12, bH: 1, joints: 5};
        this.width = width || 100;
        this.instances = instances || 50000;

        this.texLoader = new THREE.TextureLoader();

        this.initialize();
    }

    initialize = () => {
        // ground
        const groundGeo = new THREE.PlaneGeometry(this.width, this.width, 32, 32);
        const positionAttribute = groundGeo.attributes.position;

        groundGeo.rotateX(-Math.PI / 2);

        console.log(positionAttribute)

        for(let i = 0; i < positionAttribute.count; i++) {
            const x = positionAttribute.getX(i);
            const z = positionAttribute.getZ(i);
            const y = getYPosition(x, z);
            positionAttribute.setY(i, y);
        }

        positionAttribute.needsUpdate = true;
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({color: 0x000f00, side: THREE.DoubleSide});
        this.meshGrond = new THREE.Mesh(groundGeo, groundMat);

        // grass
        this.baseGeo = new THREE.PlaneGeometry(this.options.bW, this.options.bH, 1, this.options.joints);
        this.baseGeo.translate(0, this.options.bH / 2, 0);
        this.geo = new THREE.InstancedBufferGeometry();

        this.geo.index = this.baseGeo.index;
        this.geo.attributes.position = this.baseGeo.attributes.position;
        this.geo.attributes.uv = this.baseGeo.attributes.uv;

        this.attributeData = getAttributeData(this.instances, this.width);

        this.geo.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.attributeData.offsets), 3));
        this.geo.setAttribute('orientation', new THREE.InstancedBufferAttribute(new Float32Array(this.attributeData.orientations), 4));
        this.geo.setAttribute('stretch', new THREE.InstancedBufferAttribute(new Float32Array(this.attributeData.stretches), 1));
        this.geo.setAttribute('halfRootAngleSin', new THREE.InstancedBufferAttribute(new Float32Array(this.attributeData.halfRootAngleSin), 1));
        this.geo.setAttribute('halfRootAngleCos', new THREE.InstancedBufferAttribute(new Float32Array(this.attributeData.halfRootAngleCos), 1));

        this.grassMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                time: new THREE.Uniform(0),
                map: new THREE.Uniform(this.texLoader.load('/textures/grassblade.png')),
                alphaMap: new THREE.Uniform(this.texLoader.load('/textures/grassblade_alpha.png')),
                bladeHeight: new THREE.Uniform(this.options.bH),
                tipColor: new THREE.Uniform(new THREE.Color(0.0, 0.0, 0.0).convertSRGBToLinear()),
                bottomColor: new THREE.Uniform(new THREE.Color(0.0, 0.2, 0.0).convertSRGBToLinear()),
            },
            toneMapped: false,
        });

        this.mesh = new THREE.Mesh(this.geo, this.grassMaterial);

        console.log(this.mesh)
    }

    update = (time) => {
        this.grassMaterial.uniforms.time.value = time / 4;
    }
}

export { Grass };