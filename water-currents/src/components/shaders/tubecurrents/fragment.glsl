uniform float time;
uniform sampler2D uDotsTexture;
uniform sampler2D uStripesTexture;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
    // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
    float timeOffset = time * 0.07;

    float stripeTex = texture2D(uStripesTexture, vUv - timeOffset).r * 0.3;
    float stripeTexOffseted = texture2D(uStripesTexture, vUv - timeOffset * 1.5).r * 0.4;
    float dotsTex = texture2D(uDotsTexture, vUv * vec2(8.0, 4.0) - timeOffset * 1.5).r;

    float alpha = min(stripeTex, stripeTexOffseted) + dotsTex;

    // fresnel effect
    vec3 viewDirection = -normalize(vWorldPosition - cameraPosition);
    float fresnel = dot(viewDirection, vNormal);
    fresnel = pow(fresnel, 3.0);

    // vec3 color = vec3(0.136, 0.559, 0.832);
    vec3 color1 = vec3(0.579, 0.903, 0.983);

    // gl_FragColor = vec4(color1, 1.0);
    gl_FragColor = vec4(color1, alpha * fresnel);
    // gl_FragColor = vec4(vec3(fresnel), 1.0);
}