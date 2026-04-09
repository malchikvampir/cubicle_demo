<<<<<<< HEAD
// import React, { useRef, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { gsap } from "gsap";
// import { Group } from "three";

// const FACE_INDICES = { XPOS: 0, XNEG: 1, YPOS: 2, YNEG: 3, ZPOS: 4, ZNEG: 5 };
// const FACE_COLORS = ["white", "yellow", "blue", "lightgreen", "red", "orange"];

// const FACE_VECTORS = {
//   0: [ 1,  0,  0], // X+
//   1: [-1,  0,  0], // X-
//   2: [ 0,  1,  0], // Y+
//   3: [ 0, -1,  0], // Y-
//   4: [ 0,  0,  1], // Z+
//   5: [ 0,  0, -1], // Z-
// };
// const vectorToFaceIndex = (v) => {
//   const map = {
//     "1,0,0": FACE_INDICES.XPOS,
//     "-1,0,0": FACE_INDICES.XNEG,
//     "0,1,0": FACE_INDICES.YPOS,
//     "0,-1,0": FACE_INDICES.YNEG,
//     "0,0,1": FACE_INDICES.ZPOS,
//     "0,0,-1": FACE_INDICES.ZNEG,
//   };
//   return map[v.join(",")];
// };

// // Cubelet с 6 гранями
// function Cubelet({ position, colors, cubeRef }) {
//   return (
//     <mesh position={position} ref={cubeRef}>
//       <boxGeometry args={[0.9, 0.9, 0.9]} />
//       {colors.map((color, i) => (
//         <meshStandardMaterial key={i} attach={`material-${i}`} color={color} />
//       ))}
//     </mesh>
//   );
// }

// // Создание кубика с логическими координатами
// const createCubeState = () => {
//   const arr = [];
//   let idx = 0;
//   for (let x = -1; x <= 1; x++) {
//     for (let y = -1; y <= 1; y++) {
//       for (let z = -1; z <= 1; z++) {
//         const colors = Array(6).fill("gray");
//         if (x === 1) colors[FACE_INDICES.XPOS] = FACE_COLORS[0];
//         if (x === -1) colors[FACE_INDICES.XNEG] = FACE_COLORS[1];
//         if (y === 1) colors[FACE_INDICES.YPOS] = FACE_COLORS[2];
//         if (y === -1) colors[FACE_INDICES.YNEG] = FACE_COLORS[3];
//         if (z === 1) colors[FACE_INDICES.ZPOS] = FACE_COLORS[4];
//         if (z === -1) colors[FACE_INDICES.ZNEG] = FACE_COLORS[5];
//         arr.push({ index: idx, logicalPos: [x, y, z], colors });
//         idx++;
//       }
//     }
//   }
//   return arr;
// };

// // Вращение цветов внешних граней
// const rotateColors = (c, axis, angle) => {
//   const newColors = [...c.colors];
//   const cw = angle > 0;

//   if (axis === "x") {
//     [newColors[FACE_INDICES.YPOS], newColors[FACE_INDICES.ZPOS], newColors[FACE_INDICES.YNEG], newColors[FACE_INDICES.ZNEG]] =
//       cw
//         ? [c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.YNEG]]
//         : [c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.YPOS]];
//   }

//   if (axis === "y") {
//     [newColors[FACE_INDICES.XPOS], newColors[FACE_INDICES.ZPOS], newColors[FACE_INDICES.XNEG], newColors[FACE_INDICES.ZNEG]] =
//       cw
//         ? [c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.XPOS], c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.XNEG]]
//         : [c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.XNEG], c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.XPOS]];
//   }

//   if (axis === "z") {
//     [newColors[FACE_INDICES.XPOS], newColors[FACE_INDICES.YPOS], newColors[FACE_INDICES.XNEG], newColors[FACE_INDICES.YNEG]] =
//       cw
//         ? [c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.XPOS], c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.XNEG]]
//         : [c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.XNEG], c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.XPOS]];
//   }

//   return newColors;
// };

// export default function App() {
//   const groupRef = useRef();
//   const cubeRefs = useRef([]);
//   const [cubeState, setCubeState] = useState(createCubeState());

//   // Преобразуем логическую позицию в визуальную позицию
//   const getVisualPos = (logicalPos) => logicalPos.map((v) => v);

//   // Функция вращения слоя
//   const rotateLayer = (axis, layer, angle) => {
//     const selectedCubes = cubeState
//       .filter((c) => {
//         const [x, y, z] = c.logicalPos;
//         if (axis === "x") return x === layer;
//         if (axis === "y") return y === layer;
//         if (axis === "z") return z === layer;
//       })
//       .map((c) => cubeRefs.current[c.index]);

//     const tempGroup = new Group();
//     selectedCubes.forEach((c) => tempGroup.add(c));
//     groupRef.current.add(tempGroup);

//     gsap.to(tempGroup.rotation, {
//       [axis]: "+=" + angle,
//       duration: 0.5,
//       ease: "power2.inOut",
//       onComplete: () => {
//         // Обновляем логическую позицию и цвета после завершения анимации
//         setCubeState((prev) =>
//           prev.map((c) => {
//             if (!selectedCubes.includes(cubeRefs.current[c.index])) return c;

//             let [x, y, z] = c.logicalPos;
//             const s = Math.round(Math.sin(angle));
//             const cA = Math.round(Math.cos(angle));
//             let newLogical = [x, y, z];
//             if (axis === "x") newLogical = [x, cA * y - s * z, s * y + cA * z];
//             if (axis === "y") {
//               newLogical = [
//                 cA * x + s * z,
//                 y,
//                 -s * x + cA * z
//               ];
//               // const adjustedAngle = angle;
//               // // console.log({angle})
//               // const s = Math.round(Math.sin(adjustedAngle));
//               // const cA = Math.round(Math.cos(adjustedAngle));
//               // newLogical = [cA * x - s * z, y, s * x - cA * z];
//               // console.log({newLogicalY: newLogical})
//             }
//             if (axis === "z") newLogical = [cA * x - s * y, s * x + cA * y, z];

//             const newColors = rotateColors(c, axis, angle);

//             // Визуальные цвета зависят от логической позиции (целые координаты)
//             const [lx, ly, lz] = newLogical.map(Math.round);
//             const visualColors = newColors.map((color, i) => {
//               if (i === FACE_INDICES.XPOS && lx !== 1) return "gray";
//               if (i === FACE_INDICES.XNEG && lx !== -1) return "gray";
//               if (i === FACE_INDICES.YPOS && ly !== 1) return "gray";
//               if (i === FACE_INDICES.YNEG && ly !== -1) return "gray";
//               if (i === FACE_INDICES.ZPOS && lz !== 1) return "gray";
//               if (i === FACE_INDICES.ZNEG && lz !== -1) return "gray";
//               return color;
//             });
//             console.log({newLogical, visualColors})
//             return { ...c, logicalPos: newLogical, colors: visualColors };
//           })
//         );

//         selectedCubes.forEach((c) => groupRef.current.add(c));
//         groupRef.current.remove(tempGroup);
//       },
//     });
//   };

//   const checkSolved = () => {
//     const solved = FACE_COLORS.every((color, i) => {
//       const faceCells = cubeState.filter((c) => c.colors[i] === color);
//       return faceCells.length === 9;
//     });
//     alert(solved ? "Кубик собран!" : "Кубик еще не собран");
//   };

//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <div style={{ position: "absolute", top: 20, left: 20, color: "#fff", fontSize: 20, fontWeight: "bold", zIndex: 1 }}>
//         Настоящий Кубик Рубика
//       </div>
//       <div style={{ position: "absolute", top: 60, left: 20, zIndex: 1 }}>
//         {["x", "y", "z"].map((axis) =>
//           [-1, 0, 1].map((layer) => (
//             <button key={axis + layer + "p"} style={{ margin: 2 }} onClick={() => rotateLayer(axis, layer, Math.PI / 2)}>
//               {axis.toUpperCase()}={layer} +90°
//             </button>
//           ))
//         )}
//         {["x", "y", "z"].map((axis) =>
//           [-1, 0, 1].map((layer) => (
//             <button key={axis + layer + "m"} style={{ margin: 2 }} onClick={() => rotateLayer(axis, layer, -Math.PI / 2)}>
//               {axis.toUpperCase()}={layer} -90°
//             </button>
//           ))
//         )}
//         <div />
//         <button onClick={checkSolved}>Проверить сборку</button>
//       </div>

//       <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[5, 5, 5]} intensity={1} />
//         <group ref={groupRef}>
//           {cubeState.map((c) => (
//             <Cubelet
//               key={c.index}
//               position={getVisualPos(c.logicalPos)}
//               colors={c.colors}
//               cubeRef={(el) => (cubeRefs.current[c.index] = el)}
//             />
//           ))}
//         </group>
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";
import { Group } from "three";
import CubeletWithControllers from "./CubeletWithControllers";

const FACE_INDICES = { XPOS: 0, XNEG: 1, YPOS: 2, YNEG: 3, ZPOS: 4, ZNEG: 5 };
const FACE_COLORS = ["white", "yellow", "blue", "lightgreen", "red", "orange"];

const createCubeState = () => {
  const arr = [];
  let idx = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const colors = Array(6).fill("gray");
        if (x === 1) colors[FACE_INDICES.XPOS] = FACE_COLORS[0];
        if (x === -1) colors[FACE_INDICES.XNEG] = FACE_COLORS[1];
        if (y === 1) colors[FACE_INDICES.YPOS] = FACE_COLORS[2];
        if (y === -1) colors[FACE_INDICES.YNEG] = FACE_COLORS[3];
        if (z === 1) colors[FACE_INDICES.ZPOS] = FACE_COLORS[4];
        if (z === -1) colors[FACE_INDICES.ZNEG] = FACE_COLORS[5];

        arr.push({ index: idx, logicalPos: [x, y, z], colors });
        idx++;
      }
    }
  }
  return arr;
};

const rotateColors = (c, axis, angle) => {
  const newColors = [...c.colors];
  const cw = angle > 0;

  if (axis === "x") {
    [newColors[FACE_INDICES.YPOS], newColors[FACE_INDICES.ZPOS], newColors[FACE_INDICES.YNEG], newColors[FACE_INDICES.ZNEG]] =
      cw
        ? [c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.YNEG]]
        : [c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.YPOS]];
  }

  if (axis === "y") {
    [newColors[FACE_INDICES.XPOS], newColors[FACE_INDICES.ZPOS], newColors[FACE_INDICES.XNEG], newColors[FACE_INDICES.ZNEG]] =
      cw
        ? [c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.XNEG], c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.XPOS]]
        : [c.colors[FACE_INDICES.ZNEG], c.colors[FACE_INDICES.XPOS], c.colors[FACE_INDICES.ZPOS], c.colors[FACE_INDICES.XNEG]];
  }

  if (axis === "z") {
    [newColors[FACE_INDICES.XPOS], newColors[FACE_INDICES.YPOS], newColors[FACE_INDICES.XNEG], newColors[FACE_INDICES.YNEG]] =
      cw
        ? [c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.XPOS], c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.XNEG]]
        : [c.colors[FACE_INDICES.YPOS], c.colors[FACE_INDICES.XNEG], c.colors[FACE_INDICES.YNEG], c.colors[FACE_INDICES.XPOS]];
  }

  return newColors;
};

export default function App() {
  const groupRef = useRef();
  const cubeRefs = useRef([]);
  const [cubeState, setCubeState] = useState(createCubeState());
  const isAnimating = useRef(false);

  const rotateLayer = (axis, layer, angle) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const selectedCubes = cubeState
      .filter((c) => {
        const [x, y, z] = c.logicalPos;
        if (axis === "x") return x === layer;
        if (axis === "y") return y === layer;
        if (axis === "z") return z === layer;
        return null;
      })
      .map((c) => cubeRefs.current[c.index]);

    const tempGroup = new Group();
    selectedCubes.forEach((c) => tempGroup.add(c));
    groupRef.current.add(tempGroup);

    gsap.to(tempGroup.rotation, {
      [axis]: "+=" + angle,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        selectedCubes.forEach((c) => groupRef.current.add(c));
        groupRef.current.remove(tempGroup);

        setCubeState((prev) =>
          prev.map((c) => {
            if (!selectedCubes.includes(cubeRefs.current[c.index])) return c;

            let [x, y, z] = c.logicalPos;
            const s = Math.round(Math.sin(angle));
            const cA = Math.round(Math.cos(angle));
            let newLogical = [x, y, z];

            if (axis === "x") newLogical = [x, cA * y - s * z, s * y + cA * z];
            if (axis === "y") newLogical = [cA * x + s * z, y, -s * x + cA * z];
            if (axis === "z") newLogical = [cA * x - s * y, s * x + cA * y, z];

            const newColors = rotateColors(c, axis, angle);
            const [lx, ly, lz] = newLogical.map(Math.round);

            const visualColors = newColors.map((color, i) => {
              if (i === FACE_INDICES.XPOS && lx !== 1) return "gray";
              if (i === FACE_INDICES.XNEG && lx !== -1) return "gray";
              if (i === FACE_INDICES.YPOS && ly !== 1) return "gray";
              if (i === FACE_INDICES.YNEG && ly !== -1) return "gray";
              if (i === FACE_INDICES.ZPOS && lz !== 1) return "gray";
              if (i === FACE_INDICES.ZNEG && lz !== -1) return "gray";
              return color;
            });

            return { ...c, logicalPos: newLogical, colors: visualColors };
          })
        );
        isAnimating.current = false;
      },
    });
  };

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#111" }}>
      <div style={{ position: "absolute", top: 20, left: 20, color: "#fff", fontSize: 20, fontWeight: "bold", zIndex: 1 }}>
        Кубик Рубика: Управление по ребрам
      </div>

      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -8, -5]} intensity={0.4} />

        <group ref={groupRef}>
          {cubeState.map((c) => (
            <CubeletWithControllers
              key={c.index}
              position={c.logicalPos}
              logicalPos={c.logicalPos}
              colors={c.colors}
              cubeRef={(el) => (cubeRefs.current[c.index] = el)}
              onRotate={rotateLayer}
            />
          ))}
        </group>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
=======
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
>>>>>>> 6219fc9 (Initialize project using Create React App)
