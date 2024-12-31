uniform samplerCube uPerlin;

varying vec3 vPosition;
varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;  


vec3 brightnessToColor(float brightness) {
    brightness *= 0.25;

    return (vec3(brightness, brightness*brightness, brightness*brightness*brightness)/ 0.25) * 0.8;
}

float calculateFresel(vec3 eyeVector, vec3 worldNormal) {
    return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

float superSun() {
    float super = 0.0;
    
    super += textureCube(uPerlin, vLayer0).r;
    super += textureCube(uPerlin, vLayer1).r;
    super += textureCube(uPerlin, vLayer2).r;

    super *= 0.33;

    return super;
}


void main()	{
    // gl_FragColor = textureCube(uPerlin, vPosition);
    float brightness = superSun();
    brightness = brightness * 1.5 + 1.0;

    float fresnel = calculateFresel(eyeVector, normalize(vPosition));
    fresnel = pow(fresnel, 0.8);

    brightness += fresnel;

    vec3 sSun = brightnessToColor(brightness);
    gl_FragColor = vec4(sSun, 1.0);
    // gl_FragColor = vec4(vLayer0, 1.0);
}