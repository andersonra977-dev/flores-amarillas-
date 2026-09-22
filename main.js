import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// =====================================
// ESCENA
// =====================================

const escena = new THREE.Scene();


// =====================================
// CÁMARA
// =====================================

const camara = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camara.position.z = 28;
camara.position.y = 10;


// =====================================
// CONTROL 360°
// =====================================

let girando = false;

let inicioX = 0;
let inicioY = 0;

let rotacionY = 0;
let rotacionX = 0;

const velocidadGiro = 0.005;


// =====================================
// RENDER
// =====================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

document
    .getElementById("app")
    .appendChild(renderer.domElement);


// =====================================
// ESTRELLAS
// =====================================

const cantidad = 2500;

const posiciones =
    new Float32Array(cantidad * 3);

for (let i = 0; i < cantidad; i++) {

    const radio =
        20 + Math.random() * 100;

    const angulo =
        Math.random() * Math.PI * 2;

    posiciones[i * 3] =
        Math.cos(angulo) * radio;

    posiciones[i * 3 + 1] =
        (Math.random() - 0.5) * 60;

    posiciones[i * 3 + 2] =
        Math.sin(angulo) * radio;
}

const estrellasGeometry =
    new THREE.BufferGeometry();

estrellasGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        posiciones,
        3
    )
);

const estrellasMaterial =
    new THREE.PointsMaterial({

        color: 0xffffff,

        size: 0.15,

        transparent: true,

        opacity: 0.9,

        depthTest: true

    });

const estrellas =
    new THREE.Points(
        estrellasGeometry,
        estrellasMaterial
    );

escena.add(estrellas);


// =====================================
// AGUJERO NEGRO
// =====================================

const agujeroNegroGeometry =
    new THREE.SphereGeometry(
        3.5,
        64,
        64
    );

const agujeroNegroMaterial =
    new THREE.MeshBasicMaterial({

        color: 0x000000,

        depthWrite: true,

        depthTest: true

    });

const agujeroNegro =
    new THREE.Mesh(
        agujeroNegroGeometry,
        agujeroNegroMaterial
    );

agujeroNegro.renderOrder = 0;

escena.add(agujeroNegro);


// =====================================
// RESPLANDOR
// =====================================

function crearTexturaResplandor() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 512;

    const contexto =
        canvas.getContext("2d");

    const centro = 256;

    const gradiente =
        contexto.createRadialGradient(
            centro,
            centro,
            70,
            centro,
            centro,
            256
        );

    gradiente.addColorStop(
        0,
        "rgba(255,235,120,0.32)"
    );

    gradiente.addColorStop(
        0.18,
        "rgba(255,220,80,0.28)"
    );

    gradiente.addColorStop(
        0.35,
        "rgba(255,205,50,0.22)"
    );

    gradiente.addColorStop(
        0.55,
        "rgba(255,185,25,0.15)"
    );

    gradiente.addColorStop(
        0.75,
        "rgba(255,160,10,0.07)"
    );

    gradiente.addColorStop(
        1,
        "rgba(255,130,0,0)"
    );

    contexto.fillStyle =
        gradiente;

    contexto.fillRect(
        0,
        0,
        512,
        512
    );

    return new THREE.CanvasTexture(
        canvas
    );
}

const texturaResplandor =
    crearTexturaResplandor();

const resplandorMaterial =
    new THREE.SpriteMaterial({

        map: texturaResplandor,

        transparent: true,

        opacity: 1,

        depthWrite: false,

        depthTest: true,

        blending:
            THREE.AdditiveBlending

    });

const resplandor =
    new THREE.Sprite(
        resplandorMaterial
    );

resplandor.scale.set(
    23,
    23,
    1
);

resplandor.position.set(
    0,
    0,
    0
);

resplandor.renderOrder = 1;

escena.add(resplandor);


// =====================================
// LATIDO
// =====================================

let tiempoLatido = 0;


// =====================================
// ANILLOS
// =====================================

const anillos = [];

function crearAnilloDegradado(
    radioInterior,
    radioExterior,
    intensidad
) {

    const geometry =
        new THREE.RingGeometry(
            radioInterior,
            radioExterior,
            180,
            1
        );

    const material =
        new THREE.ShaderMaterial({

            transparent: true,

            depthWrite: false,

            depthTest: true,

            side: THREE.DoubleSide,

            blending:
                THREE.AdditiveBlending,

            uniforms: {

                intensidad: {
                    value: intensidad
                }

            },

            vertexShader: `

                varying float distancia;

                void main() {

                    distancia =
                        length(position.xy);

                    gl_Position =
                        projectionMatrix *
                        modelViewMatrix *
                        vec4(
                            position,
                            1.0
                        );
                }

            `,

            fragmentShader: `

                uniform float intensidad;

                varying float distancia;

                void main() {

                    float t =
                        smoothstep(
                            4.8,
                            12.5,
                            distancia
                        );

                    float brillo =
                        1.0 -
                        smoothstep(
                            0.0,
                            1.0,
                            t
                        );

                    vec3 color =
                        vec3(
                            1.0,
                            0.72,
                            0.10
                        );

                    float bordeInterior =
                        smoothstep(
                            4.75,
                            5.15,
                            distancia
                        );

                    float bordeExterior =
                        1.0 -
                        smoothstep(
                            11.5,
                            12.5,
                            distancia
                        );

                    float alpha =
                        brillo *
                        bordeInterior *
                        bordeExterior *
                        intensidad;

                    gl_FragColor =
                        vec4(
                            color,
                            alpha
                        );

                }

            `

        });

    const anillo =
        new THREE.Mesh(
            geometry,
            material
        );

    anillo.rotation.x =
        -Math.PI / 2.2;

    anillo.renderOrder = 2;

    escena.add(anillo);

    anillos.push(anillo);

    return anillo;
}


const anilloExterior =
    crearAnilloDegradado(
        6.0,
        12.5,
        0.30
    );

const anilloPrincipal =
    crearAnilloDegradado(
        5.3,
        10.8,
        0.52
    );

const anilloInterior =
    crearAnilloDegradado(
        4.8,
        8.2,
        0.90
    );

anilloInterior.renderOrder = 3;


// =====================================
// LÍNEA DE LUZ
// =====================================

const lineaGeometry =
    new THREE.RingGeometry(
        7.9,
        8.15,
        180
    );

const lineaMaterial =
    new THREE.MeshBasicMaterial({

        color: 0xffed8a,

        transparent: true,

        opacity: 0.55,

        side: THREE.DoubleSide,

        depthWrite: false,

        depthTest: true,

        blending:
            THREE.AdditiveBlending

    });

const lineaInterior =
    new THREE.Mesh(
        lineaGeometry,
        lineaMaterial
    );

lineaInterior.rotation.x =
    -Math.PI / 2.2;

lineaInterior.renderOrder = 4;

escena.add(
    lineaInterior
);


// =====================================
// FLORES
// =====================================

const flores = [];

const imagenesFlores = [

    "assets/flores/flo.png",

    "assets/flores/flo1.png"

];


// Menos flores para que las frases
// puedan verse claramente.

const cantidadFlores = 60;


// =====================================
// CREAR FLORES
// =====================================

for (
    let i = 0;
    i < cantidadFlores;
    i++
) {

    const flor =
        document.createElement("div");

    flor.className =
        "flor-galaxia";

    const imagen =
        document.createElement("img");

    imagen.src =
        imagenesFlores[
            Math.floor(
                Math.random() *
                imagenesFlores.length
            )
        ];

    imagen.alt =
        "Flor amarilla";

    flor.appendChild(
        imagen
    );

    document.body.appendChild(
        flor
    );


    // =================================
    // ÁNGULO
    // =================================

    const anguloInicial =
        Math.random() *
        Math.PI * 2;


    flores.push({

        elemento: flor,

        angulo:
            anguloInicial,

        // Órbita principal
        radio:
            10+
            Math.random() * 13,

        inclinacion:
            -0.15 +
            Math.random() * 0.3,

        altura:
            -2 +
            Math.random() * 4,

        velocidad:
            0.004 +
            Math.random() * 0.002,

        tamaño:
            18 +
            Math.random() * 16,

        giro:
            Math.random() *
            Math.PI * 10

    });

}


// =====================================
// FRASES
// =====================================

const frases = [];


// =====================================
// TEXTOS
// =====================================

const listaFrases =
    (
        typeof CONFIG !== "undefined" &&
        CONFIG.textosGalaxia
    )
        ? CONFIG.textosGalaxia
        : [

            "Para la mejor JAJAJA",
            "🌻",
            "🌻",

            "Siempre tú ✨",

            "Mi persona favorita 💕",
            "Tu amistad mi lugaar favorito🌻",

            "Contigo todo es diferente",

            "Eres mi lugar favorito 🌹",

            "Te quiero muchísimo ❤️"

        ];


// =====================================
// CREAR FRASES
// =====================================
const frasesMultiplicadas = [];

for (let i = 0; i < 3; i++) {
    frasesMultiplicadas.push(...listaFrases);
}
frasesMultiplicadas.forEach(function (texto, i) {

        const frase =
            document.createElement("div");

        frase.className =
            "frase-galaxia";

        frase.textContent =
            texto;

        document.body.appendChild(
            frase
        );


        // =================================
        // CADA FRASE TIENE SU PROPIA ÓRBITA
        // =================================

        frases.push({

            elemento: frase,

            // Posición inicial diferente
            angulo:
                (
                    Math.PI * 2 /
                    listaFrases.length
                ) * i
                +
                Math.random() * 0.4,

            // Distancia independiente
            radio:
                10 +
                Math.random() * 16,

            // Velocidad independiente
            velocidad:
                0.01 +
                Math.random() * 0.003,

            // Dirección independiente
            direccion:
                Math.random() > 0.5
                    ? 1
                    : -1,

            // Altura independiente
            altura:
                -10 +
                Math.random() * 15,

            // Inclinación independiente
            inclinacion:
                -0.30 +
                Math.random() * 0.60,

            // Tamaño
            tamaño:
                17 +
                Math.random() * 3

        });

    }
);


// =====================================
// TEXTO CENTRAL
// =====================================

const textoCentral =
    document.createElement("div");

textoCentral.className =
    "texto-central";

textoCentral.innerHTML = `

    <h1>
        Feliz día de las flores amarillas 🌻
    </h1>

    <p>
    Para le mejor amante de las estrellas🌟.
    </p>

`;

document.body.appendChild(
    textoCentral
);


// =====================================
// BOTÓN INICIO
// =====================================

const pantallaInicio = document.getElementById("inicio");
const musica = document.getElementById("musica");

pantallaInicio.addEventListener("click", function () {
    pantallaInicio.classList.add("oculto");

    musica.src = "assets/musica/musica.mp3";

    musica.play().catch(function (error) {
        console.log("Error al reproducir:", error);
    });
});


// =====================================
// CONTROL CON MOUSE
// =====================================

renderer.domElement.addEventListener(
    "pointerdown",
    function (evento) {

        girando = true;

        inicioX =
            evento.clientX;

        inicioY =
            evento.clientY;

        renderer.domElement
            .setPointerCapture(
                evento.pointerId
            );

    }
);


renderer.domElement.addEventListener(
    "pointermove",
    function (evento) {

        if (!girando) return;

        const movimientoX =
            evento.clientX -
            inicioX;

        const movimientoY =
            evento.clientY -
            inicioY;

        rotacionY +=
            movimientoX *
            velocidadGiro;

        rotacionX +=
            movimientoY *
            velocidadGiro;

        rotacionX =
            Math.max(
                -1.2,
                Math.min(
                    1.2,
                    rotacionX
                )
            );

        inicioX =
            evento.clientX;

        inicioY =
            evento.clientY;

    }
);


renderer.domElement.addEventListener(
    "pointerup",
    function () {

        girando = false;

    }
);


renderer.domElement.addEventListener(
    "pointercancel",
    function () {

        girando = false;

    }
);


// =====================================
// ANIMACIÓN
// =====================================

function animar() {

    requestAnimationFrame(
        animar
    );


    // =================================
    // LATIDO
    // =================================

    tiempoLatido += 0.025;

    const latido =
        Math.pow(
            Math.sin(
                tiempoLatido
            ),
            8
        );

    const escalaAgujero =
        1 +
        latido * 0.045;

    agujeroNegro.scale.set(
        escalaAgujero,
        escalaAgujero,
        escalaAgujero
    );


    // =================================
    // LUZ
    // =================================

    const escalaGlow =
        1 +
        latido * 0.025;

    resplandor.scale.set(
        25 * escalaGlow,
        25 * escalaGlow,
        100
    );

    resplandorMaterial.opacity =
        0.92 +
        latido * 0.08;


    // =================================
    // ESTRELLAS
    // =================================

    estrellas.rotation.y +=
        0.00015;


    // =================================
    // ANILLOS
    // =================================

    anilloPrincipal.rotation.z +=
        0.003;

    anilloInterior.rotation.z -=
        0.006;

    anilloExterior.rotation.z +=
        0.002;

    lineaInterior.rotation.z +=
        0.004;


    // =================================
    // CÁMARA
    // =================================

    const distanciaCamara = 25;

    camara.position.x =
        Math.sin(
            rotacionY
        ) *
        distanciaCamara;

    camara.position.z =
        Math.cos(
            rotacionY
        ) *
        distanciaCamara;

    camara.position.y =
        10 +
        rotacionX * 16;

    camara.lookAt(
        0,
        0,
        0
    );


    // =================================
    // FLORES
    // =================================

    flores.forEach(
        function (flor) {

            flor.angulo +=
                flor.velocidad;


            const x =
                Math.cos(
                    flor.angulo
                ) *
                flor.radio;


            const z =
                Math.sin(
                    flor.angulo
                ) *
                flor.radio;


            const y =
                Math.sin(
                    flor.angulo * 1.5
                ) *
                flor.altura;


            const yInclinado =
                y *
                Math.cos(
                    flor.inclinacion
                )
                -
                z *
                Math.sin(
                    flor.inclinacion
                );


            const zInclinado =
                y *
                Math.sin(
                    flor.inclinacion
                )
                +
                z *
                Math.cos(
                    flor.inclinacion
                );


            const posicion =
                new THREE.Vector3(
                    x,
                    yInclinado,
                    zInclinado
                );


            const distanciaFlor =
                posicion.distanceTo(
                    camara.position
                );


            posicion.project(
                camara
            );


            const pantallaX =
                (posicion.x + 1) *
                window.innerWidth /
                2;


            const pantallaY =
                (-posicion.y + 1) *
                window.innerHeight /
                2;


            flor.elemento.style.left =
                pantallaX + "px";


            flor.elemento.style.top =
                pantallaY + "px";


            const profundidad =
                THREE.MathUtils.clamp(
                    34 /
                    distanciaFlor,
                    0.45,
                    2.8
                );


            const tamaño =
                flor.tamaño *
                profundidad;


            const imagen =
                flor.elemento
                    .querySelector(
                        "img"
                    );


            imagen.style.width =
                tamaño + "px";


            flor.giro +=
                0.015;


            flor.elemento.style.transform =
                `translate(-50%, -50%)
                 rotate(${flor.giro}rad)`;


            const opacidad =
                THREE.MathUtils.clamp(
                    1.15 -
                    (
                        distanciaFlor /
                        40
                    ),
                    0.35,
                    1
                );


            flor.elemento.style.opacity =
                opacidad;


            if (
                posicion.z > 1
            ) {

                flor.elemento.style.visibility =
                    "hidden";

            } else {

                flor.elemento.style.visibility =
                    "visible";

            }

        }
    );


    // =================================
    // FRASES INDEPENDIENTES
    // =================================

    frases.forEach(
        function (frase) {

            // =================================
            // CADA FRASE GIRA POR SU CUENTA
            // =================================

            frase.angulo +=
                frase.velocidad *
                frase.direccion;


            // =================================
            // ÓRBITA PROPIA
            // =================================

            const x =
                Math.cos(
                    frase.angulo
                ) *
                frase.radio;


            const z =
                Math.sin(
                    frase.angulo
                ) *
                frase.radio;


            // =================================
            // ALTURA PROPIA
            // =================================

            const y =
                frase.altura +
                Math.sin(
                    frase.angulo * 1.5
                ) *
                1.2;


            // =================================
            // INCLINACIÓN PROPIA
            // =================================

            const yInclinado =
                y *
                Math.cos(
                    frase.inclinacion
                )
                -
                z *
                Math.sin(
                    frase.inclinacion
                );


            const zInclinado =
                y *
                Math.sin(
                    frase.inclinacion
                )
                +
                z *
                Math.cos(
                    frase.inclinacion
                );


            const posicion =
                new THREE.Vector3(
                    x,
                    yInclinado,
                    zInclinado
                );


            // =================================
            // DISTANCIA A LA CÁMARA
            // =================================

            const distanciaFrase =
                posicion.distanceTo(
                    camara.position
                );


            // =================================
            // PROYECTAR EN PANTALLA
            // =================================

            posicion.project(
                camara
            );


            const pantallaX =
                (posicion.x + 1) *
                window.innerWidth /
                2;


            const pantallaY =
                (-posicion.y + 1) *
                window.innerHeight /
                2;


            frase.elemento.style.left =
                pantallaX + "px";


            frase.elemento.style.top =
                pantallaY + "px";


            // =================================
            // TAMAÑO
            // =================================

            const profundidad =
                THREE.MathUtils.clamp(
                    30 /
                    distanciaFrase,
                    0.65,
                    1.6
                );


            frase.elemento.style.fontSize =
                (
                    frase.tamaño *
                    profundidad
                ) + "px";


            // =================================
            // OPACIDAD
            // =================================

            const opacidad =
                THREE.MathUtils.clamp(
                    1.2 -
                    (
                        distanciaFrase /
                        40
                    ),
                    0.35,
                    1
                );


            frase.elemento.style.opacity =
                opacidad;


            // =================================
            // VISIBILIDAD
            // =================================

            if (
                posicion.z > 1
            ) {

                frase.elemento.style.visibility =
                    "hidden";

            } else {

                frase.elemento.style.visibility =
                    "visible";

            }


            // =================================
            // IMPORTANTE:
            // TEXTO SIEMPRE DERECHO
            // =================================

            frase.elemento.style.transform =
                "translate(-50%, -50%)";

        }
    );


    // =================================
    // RENDER
    // =================================

    renderer.render(
        escena,
        camara
    );

}


// =====================================
// REDIMENSIONAR
// =====================================

window.addEventListener(
    "resize",
    function () {

        camara.aspect =
            window.innerWidth /
            window.innerHeight;

        camara.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// =====================================
// INICIAR
// =====================================

animar();