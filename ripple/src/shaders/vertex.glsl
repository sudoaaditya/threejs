varying vec2 vUv;

float PI = 3.141592653589793238;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}