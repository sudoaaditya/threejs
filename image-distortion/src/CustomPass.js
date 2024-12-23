const CustomPass = {

    name: 'CustomPass',

    uniforms: {

        'tDiffuse': { value: null },
        'time': { value: 0 },
        'progress': { value: 0 },
        'scale': { value: 0 }

    },

    vertexShader: /* glsl */`

        varying vec2 vUv;

        void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }`,

    fragmentShader: /* glsl */`

        uniform float scale;
        uniform float time;
        uniform float progress;

        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {

            vec2 newUV = vUv;

            // newUV = vUv + 0.1 * vec2( sin(10.0 * vUv.x), sin(10.0 * vUv.y));

            vec2 p = 2.0 * vUv - vec2(1.0);

            p += 0.1 * cos(scale * 3.0 * p.yx + 1.0 * time + vec2(1.2, 3.4));
            p += 0.1 * cos(scale * 3.7 * p.yx + 1.4 * time + vec2(2.2, 3.4));
            p += 0.1 * cos(scale * 5.0 * p.yx + 2.6 * time + vec2(4.2, 1.4));
            p += 0.3 * cos(scale * 7.0 * p.yx + 3.6 * time + vec2(10.2, 3.4));

            newUV = vUv + p * vec2(1.0, 0.0);

            newUV.x = mix(vUv.x, length(p), progress);
            newUV.y = mix(vUv.y, 0.0, progress);

            vec4 color = texture2D( tDiffuse, newUV );

            gl_FragColor = color;

            // gl_FragColor = vec4(length(p), 0.0, 0.0, 1.0);

        }`

};

export { CustomPass };
