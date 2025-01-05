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

mat3 rotate3d(vec3 axis, float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    float t = 1.0 - cosA;

    return mat3(
        t * axis.x * axis.x + cosA,        t * axis.x * axis.y - axis.z * sinA,  t * axis.x * axis.z + axis.y * sinA,
        t * axis.x * axis.y + axis.z * sinA, t * axis.y * axis.y + cosA,        t * axis.y * axis.z - axis.x * sinA,
        t * axis.x * axis.z - axis.y * sinA, t * axis.y * axis.z + axis.x * sinA, t * axis.z * axis.z + cosA
    );
}

void main() {

    float tOffset = time * 0.005;
    float angle = time;

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

    // vec3 rotatedPostion = rotate3d(vec3(0.0, 1.0, 0.0), angle) * vPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}