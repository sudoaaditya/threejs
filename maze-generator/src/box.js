
import * as THREE from 'three';

class box {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;

    this.iBoxSize = 20;
    this.size = size;
    this.rows = this.cols = size / 20;

    this.visited = false;

    this.walls = new Array(4);

    // meshes
    this.boxMesh = null;
    this.wallsMeshes = [];
    this.pointMeshs = [];

    this.lineMat = new THREE.LineBasicMaterial({ color: "white", depthWrite: false, depthTest: false });


    this.init();
  }

  init = () => {

    const iX = this.x * this.iBoxSize;
    const iY = this.y * this.iBoxSize;

    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i] = true;

      const points = [];
      let center, rotAngleX = 0;
      let boxGeo;
      if (i === 0) {
        //top wall
        points.push(new THREE.Vector3(iX, iY, 0));
        points.push(new THREE.Vector3(iX + this.iBoxSize, iY, 0));

        center = this.getCenter(new THREE.Vector3(iX, iY, 0), new THREE.Vector3(iX + this.iBoxSize, iY, 0), this.iBoxSize / 2);
        boxGeo = new THREE.BoxGeometry(20, 2, 1); // def for bot and top
      }

      if (i === 1) {
        //right wall
        points.push(new THREE.Vector3(iX + this.iBoxSize, iY, 0));
        points.push(new THREE.Vector3(iX + this.iBoxSize, iY + this.iBoxSize, 0));

        center = this.getCenter(new THREE.Vector3(iX + this.iBoxSize, iY, 0), new THREE.Vector3(iX + this.iBoxSize, iY + this.iBoxSize, 0), this.iBoxSize / 2);
        rotAngleX = 90;
        boxGeo = new THREE.BoxGeometry(2, 20, 1);
      }

      if (i === 2) {
        //bottom wall
        points.push(new THREE.Vector3(iX + this.iBoxSize, iY + this.iBoxSize, 0));
        points.push(new THREE.Vector3(iX, iY + this.iBoxSize, 0));

        center = this.getCenter(new THREE.Vector3(iX + this.iBoxSize, iY + this.iBoxSize, 0), new THREE.Vector3(iX, iY + this.iBoxSize, 0), this.iBoxSize / 2);
        boxGeo = new THREE.BoxGeometry(20, 2, 1); // def for bot and top
      }

      if (i === 3) {
        //left wall
        points.push(new THREE.Vector3(iX, iY + this.iBoxSize, 0));
        points.push(new THREE.Vector3(iX, iY, 0));

        center = this.getCenter(new THREE.Vector3(iX, iY + this.iBoxSize, 0), new THREE.Vector3(iX, iY, 0), this.iBoxSize / 2);
        rotAngleX = 90;
        boxGeo = new THREE.BoxGeometry(2, 20, 1);
      }

      /* const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, this.lineMat);
      line.renderOrder = 1
      this.wallsMeshes[i] = line; */

      const boxMesh = new THREE.Mesh(
        boxGeo,
        this.lineMat,
      );
      boxMesh.position.copy(center);
      boxMesh.rotateY(THREE.MathUtils.degToRad(rotAngleX));
      boxMesh.renderOrder = 1;
      this.wallsMeshes[i] = boxMesh;

      /* const point = new THREE.Mesh(
        new THREE.SphereGeometry(2, 32, 32),
        new THREE.MeshBasicMaterial({ color: "yellow" })
      );
      point.position.copy(center);

      this.pointMeshs[i] = point; */

      // need to draw box later!
      const planeGeo = new THREE.BufferGeometry();
      planeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        iX, iY, 0,
        iX + this.iBoxSize, iY, 0,
        iX, iY + this.iBoxSize, 0,
        iX + this.iBoxSize, iY + this.iBoxSize, 0,
      ]), 3));
      planeGeo.setIndex([0, 1, 2, 2, 1, 3])
      const planeMat = new THREE.MeshBasicMaterial({ color: '#d135fe' }); // d135fe #6e8cf1
      this.boxMesh = new THREE.Mesh(planeGeo, planeMat);
      this.boxMesh.visible = false;

      /* 
      // Other way to draw it!!!
      planeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        iX, iY + this.iBoxSize, 0,
        iX + this.iBoxSize, iY + this.iBoxSize, 0,
        iX, iY, 0,
        iX + this.iBoxSize, iY, 0,
      ]), 3));
      planeGeo.setIndex([0, 2, 1, 2, 3, 1])
      */
    }
  }

  checkNeighbour = (grid) => {
    let iRet;
    let idxArr = [];

    // top
    iRet = this.getIndex(this.x, this.y - 1);
    if (iRet !== -1 && grid[iRet].visited === false) {
      idxArr.push(iRet);
    }

    // right
    iRet = this.getIndex(this.x + 1, this.y);
    if (iRet !== -1 && grid[iRet].visited === false) {
      idxArr.push(iRet);
    }

    // bottom
    iRet = this.getIndex(this.x, this.y + 1);
    if (iRet !== -1 && grid[iRet].visited === false) {
      idxArr.push(iRet);
    }

    // left
    iRet = this.getIndex(this.x - 1, this.y);
    if (iRet !== -1 && grid[iRet].visited === false) {
      idxArr.push(iRet);
    }

    if (idxArr.length === 0) {
      return -1;
    } else {
      let id = this.getRandom(0, idxArr.length - 1);
      return idxArr[id];
    }

  }

  getIndex = (i, j) => {
    if (i < 0 || j < 0 || i > this.cols - 1 || j > this.rows - 1) {
      return (-1);
    }
    return (j + (i * this.cols));
  }

  getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getCenter = (pointA, pointB, length) => {
    const dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);
  }


  render = () => {
    for (var i = 0; i < this.walls.length; i++) {
      if (this.walls[i] === false) {
        this.wallsMeshes[i].visible = false;
      } else {
        this.wallsMeshes[i].visible = true;
      }
    }

    if (this.visited) {
      this.boxMesh.material = new THREE.MeshBasicMaterial({ color: '#d135fe' });
      this.boxMesh.material.needsUpdate = true;
    }
  }

  highlightBox = () => {
    this.boxMesh.material = new THREE.MeshBasicMaterial({ color: 'red' });
    this.boxMesh.material.needsUpdate = true;
    this.boxMesh.visible = true;
  }

}

export { box };