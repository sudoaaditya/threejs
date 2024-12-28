attribute vec3 aRandom;

uniform float time;

varying vec2 vUv;

float PI = 3.141592653589793238;


vec3 getTrefoilPosition(float progress) {
    vec3 pos = vec3(0.0);
    float angle = progress * PI * 2.0;
    // trefoil knot
    pos.x = sin(angle) + 2.0 * sin(2.0 * angle);
    pos.y = cos(angle) - 2.0 * cos(2.0 * angle);
    pos.z = -sin(3.0 * angle);
    
    return (pos);
}

vec3 getTrefoilTangent(float progress) {
    vec3 pos = vec3(0.0);
    float angle = progress * PI * 2.0;
    // trefoil knot derivative
    pos.x = cos(angle) + 4.0 * cos(2.0 * angle);
    pos.y = -sin(angle) + 4.0 * sin(2.0 * angle);
    pos.z = -3.0 * cos(3.0 * angle);
    
    return normalize(pos);
}

vec3 getTrefoilNormal(float progress) {
    vec3 pos = vec3(0.0);
    float angle = progress * PI * 2.0;
    // trefoil knot second derivative
    pos.x = -sin(angle) - 8.0 * sin(2.0 * angle);
    pos.y = -cos(angle) + 8.0 * cos(2.0 * angle);
    pos.z = 9.0 * sin(3.0 * angle);

    return normalize(pos);
}

void main() {
    vUv = uv;
    vec3 pos = position;
    float progress = fract(time * 0.01 + aRandom.x);
    
    pos = getTrefoilPosition(progress);
    vec3 normal = getTrefoilNormal(progress);
    vec3 tangent = getTrefoilTangent(progress);

    vec3 biNormal = normalize(cross(normal, tangent));

    float radius = 0.3 + aRandom.z * 0.2;
    float cx = radius * cos(aRandom.y * PI * 2.0 * time * 0.1 + aRandom.z * 7.0);
    float cy = radius * sin(aRandom.y * PI * 2.0 * time * 0.1 + aRandom.z * 7.0);

    pos += (normal * cx + biNormal * cy);

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

    gl_PointSize = 20.0 * ( 1.0 / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}