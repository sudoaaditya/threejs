uniform sampler2D uTexture;
uniform sampler2D uDiffuse;
varying vec2 vUv;


float PI = 3.141592653589793238;
void main()	{
    // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
    vec4 displacement = texture2D(uDiffuse, vUv);
    float theta = displacement.r * 2.0 * PI;

    vec2 direction = vec2(sin(theta), cos(theta));

    vec2 uv = vUv + direction * displacement.r * 0.1;
    vec4 color = texture2D(uTexture, uv);
    // gl_FragColor = vec4(vUv,0.0,1.);
    gl_FragColor = color;
}