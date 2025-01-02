varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vPosition = -modelPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
}