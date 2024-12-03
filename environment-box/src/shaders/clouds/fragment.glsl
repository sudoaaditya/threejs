
uniform sampler2D uCloudTexture;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

varying vec2 vUv;

void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep(uFogNear, uFogFar, depth);

    vec4 color = texture2D(uCloudTexture, vUv);
    color.a *= pow(color.b, 20.0);
    color = mix(color, vec4(uFogColor, color.a), fogFactor);

    gl_FragColor = color;
}