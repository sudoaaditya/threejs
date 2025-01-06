import * as THREE from 'three';


import vertexShader from './shaders/starfield/vertex.glsl';
import fragmentShader from './shaders/starfield/fragment.glsl';

class StarField {
    constructor({ starNumbers = 500, starTexture = null, starSize = 10, radiusOffset = 25 }) {
        this.starNumbers = starNumbers;
        this.starTexture = starTexture;
        this.starSize = starSize;
        this.radiusOffset = radiusOffset;

        this.stars = null;
        this.starsMaterial = null;
        this.starsGeometry = null;

        this.initialize();
    }

    getRandomSpherePoint = () => {
        const radius = Math.random() * this.radiusOffset + this.radiusOffset;

        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return {
            position: new THREE.Vector3(x, y, z),
            minDistance: radius,
            hue: 0.6,
            size: this.starSize * (Math.random() * 0.5 + 0.5)
        }
    }

    initialize = () => {
        this.starsGeometry = new THREE.BufferGeometry();

        let colors = [];
        let positions = [];
        let vertices = [];
        // let sizes = [];
        let col;

        for (let i = 0; i < this.starNumbers; i++) {
            const sPoint = this.getRandomSpherePoint();
            positions.push(sPoint);

            const { position, hue } = sPoint;
            col = new THREE.Color().setHSL(hue, 0.2, Math.random());

            vertices.push(position.x, position.y, position.z);
            colors.push(col.r, col.g, col.b);
            // sizes.push(size);
        }

        this.starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        // this.starsGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));

        this.starsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: new THREE.Uniform(this.starTexture),
                uSize: new THREE.Uniform(this.starSize),
                uTime: new THREE.Uniform(0),
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.stars = new THREE.Points(this.starsGeometry, this.starsMaterial);
    }

    updateStarMap = (map) => {
        this.starTexture = map;
        this.starsMaterial.uniforms.pointTexture.value = map;
    }

    updateStarSize = (size) => {
        this.starSize = size;
        this.starsMaterial.uniforms.uSize.value = size;
    }

    updateFieldRadius = (radius) => {
        this.starsGeometry.dispose();
        this.starsMaterial.dispose();
        this.radiusOffset = radius;
        this.initialize();
    }

    updateStarNumbers = (numbers) => {
        this.starsGeometry.dispose();
        this.starsMaterial.dispose();
        this.starNumbers = numbers;
        this.initialize();
    }

    update = (time) => {
        this.starsMaterial.uniforms.uTime.value = time;
    }
}

export default StarField;