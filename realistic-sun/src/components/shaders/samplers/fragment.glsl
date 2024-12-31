uniform float time;
varying vec3 vPosition;

#include ../utils/noise4d.glsl

float loopedNoise(vec4 pos) {
    float noise = 0.0;
    float amp = 1.0;
    float scale = 1.0;
    for(int i = 0; i < 6; i++) {
        noise += snoise(pos * scale) * amp;
        pos.a += 100.0;
        amp *= 0.9;
        scale *= 2.0;
    }
    return noise;
}

void main()	{

    float noise = loopedNoise(vec4(vPosition * 3.0, time * 0.05));

    float brightSpots = max(snoise(vec4(vPosition + 1.5, time * 0.05)), 0.0);

    gl_FragColor = vec4(vec3(noise), 1.0);
    // gl_FragColor = vec4(vec3(brightSpots), 1.0);

    gl_FragColor *= mix(1.0, brightSpots, 0.2);

}