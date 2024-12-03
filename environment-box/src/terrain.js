import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

//Shaders
import terrainVertexShader from './shaders/terrain/vertex.glsl';
import terrainFragmentShader from './shaders/terrain/fragment.glsl';

class Terrain {

    constructor(scene) { 
        this.scene = scene;

        this.textures = {};

        this.textureLoader = new THREE.TextureLoader();

        this.loadTextures();
        this.createMesh();
    }

    loadTextures = () => {
        this.textures.texDiffuse = this.textureLoader.load("/textures/weathered_planks_diff_1k.jpg");
        this.textures.texDiffuse.wrapS = this.textures.texDiffuse.wrapT = THREE.RepeatWrapping;
        this.textures.texDiffuse.minFilter = THREE.LinearFilter;

        this.textures.texNormal = this.textureLoader.load("/textures/weathered_planks_nor_gl_1k.jpg");
        this.textures.texNormal.wrapS = this.textures.texNormal.wrapT = THREE.RepeatWrapping;
        this.textures.texNormal.minFilter = THREE.LinearFilter;

        this.textures.texAo = this.textureLoader.load("/textures/weathered_planks_rough_1k.jpg");
        this.textures.texAo.wrapS = this.textures.texAo.wrapT = THREE.RepeatWrapping;
        this.textures.texAo.minFilter = THREE.LinearFilter;
    }

    createMesh = () => {
        // Brushes
        const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
        const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));
        // Evaluate
        const evaluator = new Evaluator();
        const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
        board.geometry.clearGroups();
        board.material = new THREE.MeshPhysicalMaterial({
            // color: "#fff",
            metalness: 0,
            roughness: 1,
            normalMap: this.textures.texNormal,
            map: this.textures.texDiffuse, 
            aoMap: this.textures.texAo
        })
        board.castShadow = true;
        board.receiveShadow = true;
        this.scene.add(board);

        this.uniforms = {
            uPositionFrequency: new THREE.Uniform(0.2),
            uStrength: new THREE.Uniform(2.0),
            uWarpFrequency: new THREE.Uniform(5.0),
            uWarpStrength: new THREE.Uniform(0.5),
            uTime: new THREE.Uniform(0),
            uColorWaterDeep: new THREE.Uniform(new THREE.Color("#002b3d")),
            uColorWaterSurface: new THREE.Uniform(new THREE.Color("#66a8ff")),
            uColorSand: new THREE.Uniform(new THREE.Color("#ffe894")),
            uColorGrass: new THREE.Uniform(new THREE.Color("#85d534")),
            uColorRock: new THREE.Uniform(new THREE.Color("#bfbd8d")),
            uColorSnow: new THREE.Uniform(new THREE.Color("#ffffff")),
        }

        this.material = new CustomShaderMaterial({
            //CSM
            baseMaterial: THREE.MeshStandardMaterial,
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms:  this.uniforms,
            silent: true,
            // MeshStandardMaterial
            metalness: 0,
            roughness: 0.5,
            color: "#85D534"
        })
        
        this.depthMaterial = new CustomShaderMaterial({
            //CSM
            baseMaterial: THREE.MeshDepthMaterial,
            vertexShader: terrainVertexShader,
            uniforms:  this.uniforms,
            silent: true,
            // MeshDepthMaterial
            depthPacking: THREE.RGBADepthPacking
        })

        this.geometry = new THREE.PlaneGeometry(10, 10, 500, 500);
        this.geometry.rotateX(-Math.PI * 0.5);
        this.geometry.deleteAttribute("normal");
        this.geometry.deleteAttribute("uv");

        this.mesh = new THREE.Mesh( this.geometry,  this.material);
        this.mesh.customDepthMaterial =  this.depthMaterial;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);


        // Water
        this.water = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10, 1, 1),
            new THREE.MeshPhysicalMaterial({
                transmission: 1,
                roughness: 0.2
            })
        )
        this.water.rotateX(-Math.PI * 0.5);
        this.water.position.y = -0.1;
        this.scene.add(this.water);
    }

    update = (time) => {
        this.uniforms.uTime.value = time;
    }
    
}

export { Terrain };