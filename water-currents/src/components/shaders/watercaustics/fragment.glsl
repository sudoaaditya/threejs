uniform float time;
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main()	{
    // vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

    vec2 godRay = vWorldPosition.xy - vec2(0.0, 6.0);
    float uvDirection = atan(godRay.y, godRay.x);

    float ray = texture2D(uTexture, vec2(uvDirection, 0.0) + time * 0.07).x;
    float rayTwo = texture2D(uTexture, vec2(0.1, uvDirection) + time * 0.07 * 1.5).x;

    float alpha = min(ray, rayTwo);
    float fade = smoothstep(0.15, 0.87, abs(vUv.y));

    gl_FragColor = vec4(vec3(alpha), alpha * 0.3 * fade);
    // gl_FragColor = vec4(vWorldPosition, 1.0);
}