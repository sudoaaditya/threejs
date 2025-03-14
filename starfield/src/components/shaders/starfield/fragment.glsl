uniform sampler2D pointTexture;
uniform float uTime;

varying vec3 vColor;
varying float vRandom;

uniform bool uTwinkle;

void main() {

    vec4 color = vec4(vColor, 1.0);

    vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
    color *= textureColor;

    // twinkle effect
    if(uTwinkle) {
        float time = uTime * 0.7;
        float twinkle = 0.5 + 0.5 * sin(time * vRandom);
        color *= twinkle;
    }

    gl_FragColor = color;
}