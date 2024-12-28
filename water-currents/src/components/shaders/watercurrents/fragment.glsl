uniform sampler2D uTexture;

void main()	{
    vec2 st = gl_PointCoord.xy;
    vec4 normalTexture = texture2D(uTexture, st);

    // calculate normal from texture
    vec3 normal = vec3(normalTexture.rg * 2.0 - 1.0, 0.0);
    normal.z = sqrt(1.0 - normal.x * normal.x - normal.y * normal.y);
    normal = normalize(normal);

    float disc = length(st - vec2(0.5));
    float alpha = smoothstep(0.5, 0.48, disc);

    // calculate lights
    vec3 lightPosition = vec3(1.0);
    float diffuse = max(0.0, dot(normal, normalize(lightPosition)));

    vec3 color = vec3(0.136, 0.559, 0.832);
    vec3 color1 = vec3(0.579, 0.903, 0.983);

    gl_FragColor = vec4(color1, alpha * diffuse * 0.5);
}