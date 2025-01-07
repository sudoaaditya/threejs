import './style.css'; import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { box } from './box';

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

    // maze pars
    this.grid = new Array();
    this.stack = new Array();
    this.current = null;
    this.rows = 600 / 20;
    this.cols = 600 / 20;

    this.initialize();
  }

  initialize = () => {
    this.scene = new THREE.Scene();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor('#000000', 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

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
      (window.innerWidth / window.innerHeight),
      0.001,
      1000
    );

    // this.camera = new THREE.OrthographicCamera(-400, 400, 400, -400, 400, -400)

    this.camera.position.set(300, 300, 500);

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

  addContents = () => {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        const boxB = new box(i, j, 600)
        this.grid.push(boxB)
        this.scene.add(boxB.boxMesh)
        this.scene.add(...boxB.wallsMeshes);
      }
    }
    this.current = this.grid[0];
  }


  update = () => {
    // this.controls.update();
    this.render();

    this.grid.forEach(box => box.render());

    // algorithm!
    this.current.visited = true;
    this.current.highlightBox();

    let iRetIdx = this.current.checkNeighbour(this.grid);
    if (iRetIdx !== -1) {
      let next = this.grid[iRetIdx];

      next.visited = true;

      this.stack.push(this.current);

      this.removeWalls(this.current, next);

      this.current = next;
    } else if (this.stack.length) {
      this.current = this.stack.pop();
    }

    this.frameId = window.requestAnimationFrame(this.update);
  }

  render = () => {
    let { renderer, scene, camera, } = this;
    if (renderer) {
      renderer.render(scene, camera);
    }
  }

  removeWalls = (a, b) => {
    const xDiff = a.x - b.x;
    if (xDiff === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (xDiff === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }

    const yDiff = a.y - b.y;
    if (yDiff === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (yDiff === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  }

}

new Sketch(document.getElementById("webgl-canvas"))