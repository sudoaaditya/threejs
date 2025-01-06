uniform sampler2D pointTexture;
uniform float uTime;

varying vec3 vColor;

void main() {

    vec4 color = vec4(vColor, 1.0);

    vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
    color *= textureColor;

    // // twinkle effect
    // float time = uTime * 0.1;
    // float twinkle = 0.5 + 0.5 * sin(time * 5.0);
    // color *= twinkle;

    gl_FragColor = color;
}