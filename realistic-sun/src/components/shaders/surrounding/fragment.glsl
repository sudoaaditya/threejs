varying vec3 vNormal;
varying vec3 vPosition;

vec3 brightnessToColor(float brightness) {
    brightness *= 0.25;

    return (vec3(brightness, brightness * brightness, brightness * brightness * brightness) / 0.25) * 0.8;
}

void main() {
    float radial = 0.5 - dot(normalize(vNormal), normalize(vPosition));

    radial *= radial * radial;

    float brightness = 1.0 + radial * 0.83;

    gl_FragColor.rgb = brightnessToColor(brightness);
    gl_FragColor.a = radial;
}