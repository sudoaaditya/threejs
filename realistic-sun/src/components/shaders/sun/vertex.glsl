uniform float time;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;

mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

void main() {

    float tOffset = time * 0.005;

    vec3 p0 = position;
    p0.yz = rotate(tOffset) * p0.yz;
    vLayer0 = p0;

    vec3 p1 = position;
    p1.xz = rotate(tOffset * 2.0 + 1.0) * p1.xz;
    vLayer1 = p1;

    vec3 p2 = position;
    p2.xy = rotate(tOffset * 1.5 + 3.0) * p2.xy;
    vLayer2 = p2;

    // calculate the eye vector
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    eyeVector = normalize(worldPosition.xyz - cameraPosition);

    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}