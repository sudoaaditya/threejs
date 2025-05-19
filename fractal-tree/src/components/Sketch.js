import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';

import niceColors from 'nice-color-palettes';
import GUI from 'lil-gui';


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

        this.treeQueue = [];

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

    settings = () => {
        this.params = {
            rotationAngle: 45,
            branchLength: 20,
        };

        this.gui.add(this.params, 'rotationAngle', 0, 180, 5).onChange(() => {
            /* this.scene.remove(this.tree);
            this.tree = this.createBranch(this.params.branchLength);
            this.scene.add(this.tree);
            this.setCameraAtTreeCenter(); */
            this.scene.remove(this.tree);
            this.treeQueue = [];
            this.addContents();
        });
    }

    setupCamera = () => {

        this.camera = new THREE.PerspectiveCamera(
            35,
            (this.sizes.width / this.sizes.height),
            0.1,
            1000
        );

        this.camera.position.set(0, 0, 100);

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
    }

    start = () => {
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 30; // 30 FPS
        const loop = (timestamp) => {
            if (timestamp - this.lastFrameTime >= this.frameInterval) {
                this.lastFrameTime = timestamp;
                this.update();
            }
            this.frameId = requestAnimationFrame(loop);
        };
        this.frameId = requestAnimationFrame(loop);
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    }

    addContents = () => {
        // render base scene data!
        // this.tree = this.createBranch(this.params.branchLength);
        // this.scene.add(this.tree);

        // this.tree = new THREE.Group();
        // this.scene.add(this.tree);
        // this.animateBranch(20, this.tree);

        const color = niceColors[Math.floor(Math.random() * 25)][Math.floor(Math.random() * 5)];
        this.material = new THREE.LineBasicMaterial({ color });

        this.tree = new THREE.Group();
        this.scene.add(this.tree);

        this.enqueueBranch(this.params.branchLength, this.tree, 0);

        // this.setCameraAtTreeCenter();
    }

    setCameraAtTreeCenter = () => {
        const box = new THREE.Box3().setFromObject(this.tree);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        this.camera.position.set(center.x, center.y, -size.y * 2);
        this.camera.lookAt(center);
        this.camera.updateProjectionMatrix();
        // this.controls.target.copy(center);
        // this.controls.update();
    }

    createBranch = (length, color = 'red') => {
        const group = new THREE.Group();

        // set random color for each branch
        if (!color) {
            color = niceColors[Math.floor(Math.random() * 25)][Math.floor(Math.random() * 5)];
        }
        const material = new THREE.LineBasicMaterial({ color });

        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, length, 0)
        ]);

        const line = new THREE.Line(lineGeom, material);
        group.add(line);

        if (length < 0.5) return group;

        const branchLength = length * 0.67;
        // const colorA = niceColors[Math.floor(Math.random() * 25)][Math.floor(Math.random() * 5)];
        // create right branch
        const rightBranch = this.createBranch(branchLength, color);
        rightBranch.position.y = length;
        rightBranch.rotation.z = THREE.MathUtils.degToRad(this.params.rotationAngle);
        group.add(rightBranch);

        // create left branch
        const leftBranch = this.createBranch(branchLength, color);
        leftBranch.position.y = length;
        leftBranch.rotation.z = THREE.MathUtils.degToRad(-this.params.rotationAngle);;
        group.add(leftBranch);

        return group;
    }

    animateBranch(length, parent, delay = 0) {
        if (length < 0.5) return;

        setTimeout(() => {
            const color = niceColors[Math.floor(Math.random() * 25)][Math.floor(Math.random() * 5)];
            const material = new THREE.LineBasicMaterial({ color });
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, length, 0)
            ]);
            const line = new THREE.Line(geometry, material);

            const branchGroup = new THREE.Group();
            branchGroup.add(line);
            parent.add(branchGroup);

            // Schedule right branch
            const rightBranch = new THREE.Group();
            rightBranch.position.y = length;
            rightBranch.rotation.z = Math.random() * 0.5 + 0.5;
            branchGroup.add(rightBranch);
            this.animateBranch(length * 0.67, rightBranch, delay + 20);

            // Schedule left branch
            const leftBranch = new THREE.Group();
            leftBranch.position.y = length;
            leftBranch.rotation.z = -Math.random() * 0.5 - 0.5;
            branchGroup.add(leftBranch);
            this.animateBranch(length * 0.67, leftBranch, delay + 20);

            this.setCameraAtTreeCenter();
        }, delay);
    }

    enqueueBranch = (length, parent, depth) => {
        this.treeQueue.push({ length, parent, depth });
    }

    growTree = () => {
        const batchSize = 3;

        for (let i = 0; i < batchSize && this.treeQueue.length > 0; i++) {
            const { length, parent, depth } = this.treeQueue.shift();

            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, length, 0)
            ]);
            const line = new THREE.Line(geometry, this.material);

            const branchGroup = new THREE.Group();
            branchGroup.add(line);
            parent.add(branchGroup);

            if (length < 0.5) return;

            const nextLength = length * 0.67;

            const right = new THREE.Group();
            right.position.y = length;
            right.rotation.z = THREE.MathUtils.degToRad(this.params.rotationAngle);
            branchGroup.add(right);
            this.enqueueBranch(nextLength, right, depth + 1);

            const left = new THREE.Group();
            left.position.y = length;
            left.rotation.z = -THREE.MathUtils.degToRad(this.params.rotationAngle);
            branchGroup.add(left);
            this.enqueueBranch(nextLength, left, depth + 1);
        }

    }

    update = () => {
        this.elpasedTime = this.clock.getElapsedTime();

        // this.scene.remove(this.tree);
        // this.tree = this.createBranch(this.params.branchLength);
        // this.scene.add(this.tree);
        // this.setCameraAtTreeCenter();

        this.growTree();
        this.render();

        if (this.treeQueue.length % 10 === 0) {
            this.setCameraAtTreeCenter();
        }

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