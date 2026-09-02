// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// export default function FireBallAAA() {
//   const ref = useRef(null);

//   useEffect(() => {
//     const mount = ref.current;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x05060c);

//     const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
//     mount.appendChild(renderer.domElement);

//     // =========================
//     // BLOOM (UNREAL STYLE)
//     // =========================
//     const composer = new EffectComposer(renderer);
//     composer.addPass(new RenderPass(scene, camera));

//     const bloom = new UnrealBloomPass(
//       new THREE.Vector2(window.innerWidth, window.innerHeight),
//       3.2,
//       0.6,
//       0.85
//     );
//     composer.addPass(bloom);

//     // =========================
//     // FIRE + HEAT DISTORTION SHADER
//     // =========================
//     const fireMat = new THREE.ShaderMaterial({
//       transparent: true,
//       uniforms: {
//         uTime: { value: 0 },
//         uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
//       },
//       vertexShader: `
//         void main(){
//           gl_Position = vec4(position,1.0);
//         }
//       `,
//       fragmentShader: `
//         precision highp float;

//         uniform float uTime;
//         uniform vec2 uRes;

//         float hash(vec3 p){
//           p = fract(p * 0.3183099 + 0.1);
//           p *= 17.0;
//           return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
//         }

//         float noise(vec3 p){
//           vec3 i = floor(p);
//           vec3 f = fract(p);
//           f = f*f*(3.0-2.0*f);

//           return mix(
//             mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
//                 mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
//             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
//                 mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),
//           f.z);
//         }

//         float fbm(vec3 p){
//           float v = 0.0;
//           v += 0.55 * noise(p);
//           p *= 2.0;
//           v += 0.25 * noise(p);
//           p *= 2.0;
//           v += 0.125 * noise(p);
//           return v;
//         }

//         float fire(vec3 p){
//           p.y -= uTime * 0.9;

//           float n = fbm(p * 3.0);

//           float shape = 1.0 - smoothstep(0.0, 1.3, length(p));

//           float core = smoothstep(0.4, 0.0, length(p));

//           return n * shape + core * 2.0;
//         }

//         void main(){

//           vec2 uv = gl_FragCoord.xy / uRes.xy;
//           vec2 p = uv * 2.0 - 1.0;
//           p.x *= uRes.x / uRes.y;

//           vec3 ro = vec3(0.0,0.0,2.2);
//           vec3 rd = normalize(vec3(p,-1.6));

//           float t = 0.0;
//           float acc = 0.0;

//           float heat = 0.0;

//           // =========================
//           // RAYMARCH FIRE VOLUME
//           // =========================
//           for(int i=0;i<96;i++){
//             vec3 pos = ro + rd * t;

//             float f = fire(pos);

//             float d = smoothstep(0.2,0.9,f);

//             acc += d * 0.03;

//             heat += f * 0.01;

//             t += 0.035;
//           }

//           // =========================
//           // HEAT DISTORTION (IMPORTANT)
//           // =========================
//           vec2 distortion = vec2(
//             fbm(vec3(p*2.0,uTime))*0.01,
//             fbm(vec3(p*2.0,uTime+10.0))*0.01
//           );

//           float distHeat = heat * 0.08;

//           vec2 uvDist = uv + distortion * distHeat;

//           // =========================
//           // COLOR GRADING
//           // =========================
//           vec3 col = mix(
//             vec3(0.02,0.02,0.06),
//             vec3(1.0,0.25,0.02),
//             acc
//           );

//           col = mix(col, vec3(1.0,1.0,0.6), smoothstep(0.4,1.0,acc));

//           float coreGlow = 1.0 / (0.15 + length(p));

//           col += coreGlow * 0.4;

//           float alpha = clamp(acc + heat * 0.2, 0.0, 1.0);

//           gl_FragColor = vec4(col * (acc + 0.6), alpha);
//         }
//       `
//     });

//     const fireMesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), fireMat);
//     scene.add(fireMesh);

//     // =========================
//     // EMBERS (AAA TOUCH)
//     // =========================
//     const COUNT = 600;
//     const geo = new THREE.BufferGeometry();
//     const pos = new Float32Array(COUNT * 3);

//     for (let i=0;i<COUNT;i++){
//       pos[i*3] = (Math.random()-0.5)*1.5;
//       pos[i*3+1] = (Math.random()-0.5)*1.5;
//       pos[i*3+2] = (Math.random()-0.5)*0.8;
//     }

//     geo.setAttribute("position", new THREE.BufferAttribute(pos,3));

//     const mat = new THREE.PointsMaterial({
//       color: 0xffaa33,
//       size: 0.02,
//       transparent: true,
//       blending: THREE.AdditiveBlending,
//       depthWrite: false
//     });

//     const embers = new THREE.Points(geo, mat);
//     scene.add(embers);

//     // =========================
//     // LOOP
//     // =========================
//     const clock = new THREE.Clock();

//     const animate = () => {
//       const t = clock.getElapsedTime();

//       fireMat.uniforms.uTime.value = t;

//       embers.rotation.y += 0.002;
//       embers.position.y += Math.sin(t)*0.0003;

//       composer.render();
//       requestAnimationFrame(animate);
//     };

//     animate();

//     // =========================
//     // RESIZE
//     // =========================
//     const onResize = () => {
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       composer.setSize(window.innerWidth, window.innerHeight);
//       fireMat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
//     };

//     window.addEventListener("resize", onResize);

//     return () => {
//       window.removeEventListener("resize", onResize);
//       mount.removeChild(renderer.domElement);
//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={ref} style={{ position:"fixed", inset:0 }} />;
// }
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Joint({ children, position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.z = Math.sin(t * 2) * 0.25;
    }
  });
  return <group ref={ref} position={position}>{children}</group>;
}

function Hair() {
  return (
    <group>
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color="#2b1b17" />
      </mesh>
      <mesh position={[0, 1.95, -0.25]}>
        <cylinderGeometry args={[0.35, 0.4, 0.9, 32]} />
        <meshStandardMaterial color="#2b1b17" />
      </mesh>
    </group>
  );
}

function Face() {
  return (
    <group>
      <mesh position={[-0.1, 1.85, 0.28]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.1, 1.85, 0.28]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0, 1.78, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.1, 16]} />
        <meshStandardMaterial color="#ffd1dc" />
      </mesh>
    </group>
  );
}

function Hand() {
  return (
    <group position={[0, -0.7, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      {[-0.05, 0, 0.05].map((x, i) => (
        <mesh key={i} position={[x, -0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
      ))}
    </group>
  );
}

function Arm() {
  return (
    <group>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#ffb6c1" />
      </mesh>
      <Hand />
    </group>
  );
}

function Dress() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[1, 1.6, 64]} />
        <meshStandardMaterial color="#ff4da6" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 100]} />
        <meshStandardMaterial color="#ff85c1" />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <torusGeometry args={[0.9, 0.08, 16, 100]} />
        <meshStandardMaterial color="#ff99cc" />
      </mesh>
    </group>
  );
}

function Ragdoll({ dress }) {
  return (
    <group scale={1.8}>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ffe0e6" />
      </mesh>

      <Hair />
      <Face />

      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.7, 1.4, 0.4]} />
        <meshStandardMaterial color="#ffc0cb" />
      </mesh>

      <Joint position={[-0.55, 1.4, 0]}>
        <Arm />
      </Joint>

      <Joint position={[0.55, 1.4, 0]}>
        <Arm />
      </Joint>

      <Joint position={[-0.35, -0.7, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.14, 1.4, 16]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
      </Joint>

      <Joint position={[0.35, -0.7, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.14, 1.4, 16]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
      </Joint>

      {dress && <Dress />}
    </group>
  );
}

export default function App() {
  const [dress, setDress] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <button onClick={() => setDress((v) => !v)}>
          Toggle Dress
        </button>
      </div>

      <Canvas camera={{ position: [0, 3, 7] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Ragdoll dress={dress} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
