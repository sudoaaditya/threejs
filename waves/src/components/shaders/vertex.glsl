uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
uniform vec2 pixels;

attribute float aRamdom;
float PI = 3.141592653589793238;
void main() {
    vUv = uv;

    float offset = aRamdom + sin(time + 15.0 * aRamdom);
    offset *= 0.35;
    
    vec4 mvPosition = modelMatrix * instanceMatrix * vec4( position, 1.0 );
    mvPosition.y += offset;
    mvPosition = viewMatrix * mvPosition;

    vViewPosition = - mvPosition.xyz;
    vNormal = normalMatrix * normal;

    vec4 worldPosition = modelMatrix * instanceMatrix * vec4( position, 1.0 );
    worldPosition.y += offset;
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}