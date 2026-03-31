import './style.css'; import * as THREE from 'three';
import { box } from './box';

import GUI from 'lil-gui';
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

    this.settings = {
      gridSize: 700,
      cellSize: 40,
      highlightColor: "#B3ffff",
      visitedColor: "#088478",
    };

    // maze pars
    this.grid = new Array();
    this.stack = new Array();
    this.current = null;
    this.complete = false;
    this.completePulseTime = 0;
    this.rows = this.cols = Math.floor(this.settings.gridSize / this.settings.cellSize);

    this.initialize();
  }

  initialize = () => {
    this.scene = new THREE.Scene();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor('#05080a', 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    //Setup Camera & Resize
    this.setupCamera();
    this.setupResize();

    this.time = 0;

    // warmup calls
    this.resize();
    this.render();

    //Setuup world
    this.setSettings()
    this.addContents();

    //Start ANimation Loop
    this.start();
  }

  setupCamera = () => {
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2, this.width / 2,
      this.height / 2, -this.height / 2,
      -1000, 1000
    )

    this.camera.position.set(this.settings.gridSize / 2, this.settings.gridSize / 2, 0);
  }

  setupResize = () => {
    window.addEventListener('resize', this.resize);
  }

  resize = () => {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    // update orthographic camera
    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
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

  setSettings = () => {
    this.gui = new GUI();

    this.gui.add(this.settings, 'gridSize', 100, 900, 10).onChange(() => {
      this.reset();
    });

    this.gui.add(this.settings, 'cellSize', 10, 100, 10).onChange(() => {
      this.reset();
    });

    const colorFOlder = this.gui.addFolder('Colors');

    colorFOlder.addColor(this.settings, 'highlightColor').onChange(() => {
      this.grid.forEach(box => box.updateColors(this.settings.visitedColor, this.settings.highlightColor));
    });

    colorFOlder.addColor(this.settings, 'visitedColor').onChange(() => {
      this.grid.forEach(box => box.updateColors(this.settings.visitedColor, this.settings.highlightColor));
    });

  }

  reset = () => {
    this.resetting = true;

    if (this.boxGroup) {
      this.scene.remove(this.boxGroup);
    }

    this.grid.forEach((cell) => {
      cell.dispose();
    });

    this.grid = [];
    this.stack = [];
    this.current = null;
    this.complete = false;
    this.completePulseTime = 0;
    this.rows = Math.floor(this.settings.gridSize / this.settings.cellSize);
    this.cols = Math.floor(this.settings.gridSize / this.settings.cellSize);

    this.addContents();
    this.resetting = false;
  }

  addContents = () => {
    this.boxGroup = new THREE.Group();
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < this.cols; j++) {
        const boxB = new box(i, j, this.settings.gridSize, this.settings.cellSize)
        this.grid.push(boxB)
        this.boxGroup.add(boxB.boxMesh);
        this.boxGroup.add(...boxB.wallsMeshes);
      }
    }
    this.scene.add(this.boxGroup);
    this.updateCameraPosition();

    this.current = this.grid[this.rows - 1];
    this.complete = false;
    this.completePulseTime = 0;
  }

  updateCameraPosition = () => {
    this.camera.position.set(
      this.settings.gridSize / 2,
      this.settings.gridSize / 2,
      this.settings.gridSize / this.settings.cellSize
    );

    this.camera.lookAt(this.settings.gridSize / 2, this.settings.gridSize / 2, 0);
  }


  update = () => {
    this.render();

    this.grid.forEach(box => box.render());
    this.animateCompletionState();

    // algorithm!
    if (!this.resetting && !this.complete) {
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
      } else {
        this.complete = true;
      }
    }

    this.frameId = window.requestAnimationFrame(this.update);
  }

  render = () => {
    let { renderer, scene, camera, } = this;
    if (renderer) {
      renderer.render(scene, camera);
    }
  }

  animateCompletionState = () => {
    if (!this.complete || !this.boxGroup) {
      return;
    }

    this.completePulseTime += 0.04;
    const pulse = 0.84 + (Math.sin(this.completePulseTime) * 0.16);

    this.grid.forEach((cell) => {
      if (cell.wallMat) {
        cell.wallMat.opacity = pulse;
      }
      if (cell.visitedMat && cell.visited) {
        cell.visitedMat.opacity = 0.24 + (Math.sin(this.completePulseTime + (cell.x + cell.y) * 0.08) * 0.06);
      }
    });
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