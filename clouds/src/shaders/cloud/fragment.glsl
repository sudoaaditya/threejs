uniform sampler2D map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
varying vec2 vUv;

void main() {

    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = smoothstep(fogFar, fogNear, depth);

    gl_FragColor = texture(map, vUv);
    gl_FragColor.a *= pow(gl_FragCoord.b, 20.0);
    gl_FragColor = vec4(mix(fogColor, gl_FragColor.rgb, fogFactor), gl_FragColor.a);

    // gl_FragColor = vec4(vUv, 1.0, 1.0);

}