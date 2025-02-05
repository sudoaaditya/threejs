
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

const simplex2d = createNoise2D();

const getAttributeData = (instances, width) => {

    const offsets = [];
    const orientations = [];
    const stretches = [];
    const halfRootAngleSin = [];
    const halfRootAngleCos = [];

    let quaternion_0 = new THREE.Vector4();
    let quaternion_1 = new THREE.Vector4();

    // the min & max angle for growth direction [ Radians ]
    const min = -0.25;
    const max = 0.25;

    // for each instace of grass blade
    for(let i = 0; i < instances; i++) {

        //offsets of roots
        const offsetX = Math.random() * width - width / 2;
        const offsetZ = Math.random() * width - width / 2;
        const offsetY = getYPosition(offsetX, offsetZ);
        offsets.push(offsetX, offsetY, offsetZ);

        // Growth Directions
        // Rotate around Y
        const angle = Math.PI - Math.random() * ( 2 * Math.PI );
        halfRootAngleSin.push(Math.sin(0.5 * angle));
        halfRootAngleCos.push(Math.cos(0.5 * angle));
        
        // Rotate around Y
        let rotationAxis = new THREE.Vector3(0, 1, 0);
        let x = rotationAxis.x * Math.sin(angle / 2);
        let y = rotationAxis.y * Math.sin(angle / 2);
        let z = rotationAxis.z * Math.sin(angle / 2);
        let w = Math.cos(angle / 2);
        quaternion_0.set(x, y, z, w).normalize();

        // Rotate around X
        const angleX = min + Math.random() * (max - min);
        rotationAxis = new THREE.Vector3(1, 0, 0);
        x = rotationAxis.x * Math.sin(angleX / 2);
        y = rotationAxis.y * Math.sin(angleX / 2);
        z = rotationAxis.z * Math.sin(angleX / 2);
        w = Math.cos(angleX / 2);
        quaternion_1.set(x, y, z, w).normalize();

        // Multiply the two rotations
        quaternion_0 = multuplyQuaternions(quaternion_0, quaternion_1);

        // Rotate around Z
        const angleZ = min + Math.random() * (max - min);
        rotationAxis = new THREE.Vector3(0, 0, 1);
        x = rotationAxis.x * Math.sin(angleZ / 2);
        y = rotationAxis.y * Math.sin(angleZ / 2);
        z = rotationAxis.z * Math.sin(angleZ / 2);
        w = Math.cos(angleZ / 2);
        quaternion_1.set(x, y, z, w).normalize();

        // Multiply the two rotations
        quaternion_0 = multuplyQuaternions(quaternion_0, quaternion_1);

        orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);

        // Stretch
        if(i < instances / 3) {
            stretches.push(Math.random() * 1.8);
        } else {
            stretches.push(Math.random());
        }
    }

    return {
        offsets,
        orientations,
        stretches,
        halfRootAngleSin,
        halfRootAngleCos
    }
}

const multuplyQuaternions = (q1, q2) => {
    const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x
    const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y
    const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z
    const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w
    return new THREE.Vector4(x, y, z, w)
}
const getYPosition = (x, z) => {

    let y = 2 * simplex2d(x / 50, z / 50);
    y += 4 * simplex2d(x / 100, z / 100);
    y += 0.2 * simplex2d(x / 10, z / 10);

    return y;
}

export { getAttributeData, getYPosition };
