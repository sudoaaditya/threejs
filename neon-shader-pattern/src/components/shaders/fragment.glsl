uniform float time;
uniform vec2 uResolution;

uniform int uColorLoopCounter;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uThickness;
uniform float uFractValue;

varying vec2 vUv;

vec3 palette(in float t) {
    // vec3 a = vec3(0.5, 0.5, 0.5);
    // vec3 b = vec3(0.5, 0.5, 0.5);
    // vec3 c = vec3(1.0, 1.0, 1.0);
    // vec3 d = vec3(0.263, 0.416, 0.557);

    // return a + b * cos(6.283185 * (c * t + d));
    return uColorA + uColorB * cos(6.283185 * (uColorC * t + uColorD));
}

void main() {

    vec2 uv = vUv;
    uv = (uv * 2.0) - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.15);

    for(int i = 0; i < uColorLoopCounter; i++) {
        uv = fract(uv * uFractValue) - 0.5;

        float d = length(uv) * exp(-length(uv0));
        vec3 color = palette(length(uv0) + float(i) * 0.4 + time * 0.4);

        d = sin(d * 8.0 + time) / (1.5 * uThickness);
        // d = 5.0 - cos(d * 4.0 + time) / 20.0;
        d = abs(d);
        d = smoothstep(0.0, 0.1, d);
        d = pow(0.01 / d, 1.0);
        // d *= pow(0.01 / d, 2.0);

        finalColor += color * d;
    }

    gl_FragColor = vec4(uv, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, 1.0);
}
