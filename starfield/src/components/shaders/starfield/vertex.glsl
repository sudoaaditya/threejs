attribute vec3 color;
attribute float aRandom;

uniform float uSize;
varying vec3 vColor;
varying float vRandom;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_PointSize = uSize * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vColor = color;
    vRandom = aRandom;
}