import React from "react";
import * as THREE from "three";

const FACE_INDICES = { XPOS: 0, XNEG: 1, YPOS: 2, YNEG: 3, ZPOS: 4, ZNEG: 5 };

// Создаем форму трапеции один раз вне компонента
const trapezoidShape = new THREE.Shape();
trapezoidShape.moveTo(-0.45, 0);
trapezoidShape.lineTo(0.45, 0);
trapezoidShape.lineTo(0.27, 0.18);
trapezoidShape.lineTo(-0.27, 0.18);

// Компонент одной интерактивной трапеции
function EdgeController({ faceIndex, edge, onClick }) {
  const offset = 0.452; // Вынос чуть вперед для предотвращения Z-fighting
  const shift = 0.45;   // Смещение широкого основания к краю квадрата

  let position = [0, 0, 0];
  let rotation = [0, 0, 0];

  // Матрица трансформаций положения и поворота трапеции
  if (faceIndex === FACE_INDICES.XPOS) {
    if (edge === "top")    { position = [offset, shift, 0]; rotation = [0, Math.PI / 2, Math.PI]; }
    if (edge === "bottom") { position = [offset, -shift, 0]; rotation = [0, Math.PI / 2, 0]; }
    if (edge === "left")   { position = [offset, 0, -shift]; rotation = [0, Math.PI / 2, -Math.PI / 2]; }
    if (edge === "right")  { position = [offset, 0, shift]; rotation = [0, Math.PI / 2, Math.PI / 2]; }
  }
  else if (faceIndex === FACE_INDICES.XNEG) {
    if (edge === "top")    { position = [-offset, shift, 0]; rotation = [0, -Math.PI / 2, 0]; }
    if (edge === "bottom") { position = [-offset, -shift, 0]; rotation = [0, -Math.PI / 2, Math.PI]; }
    if (edge === "left")   { position = [-offset, 0, shift]; rotation = [0, -Math.PI / 2, -Math.PI / 2]; }
    if (edge === "right")  { position = [-offset, 0, -shift]; rotation = [0, -Math.PI / 2, Math.PI / 2]; }
  }
  else if (faceIndex === FACE_INDICES.YPOS) {
    if (edge === "top")    { position = [0, offset, -shift]; rotation = [-Math.PI / 2, 0, Math.PI]; }
    if (edge === "bottom") { position = [0, offset, shift]; rotation = [-Math.PI / 2, 0, 0]; }
    if (edge === "left")   { position = [-shift, offset, 0]; rotation = [-Math.PI / 2, 0, -Math.PI / 2]; }
    if (edge === "right")  { position = [shift, offset, 0]; rotation = [-Math.PI / 2, 0, Math.PI / 2]; }
  }
  else if (faceIndex === FACE_INDICES.YNEG) {
    if (edge === "top")    { position = [0, -offset, shift]; rotation = [Math.PI / 2, 0, Math.PI]; }
    if (edge === "bottom") { position = [0, -offset, -shift]; rotation = [Math.PI / 2, 0, 0]; }
    if (edge === "left")   { position = [-shift, -offset, 0]; rotation = [Math.PI / 2, 0, Math.PI / 2]; }
    if (edge === "right")  { position = [shift, -offset, 0]; rotation = [Math.PI / 2, 0, -Math.PI / 2]; }
  }
  else if (faceIndex === FACE_INDICES.ZPOS) {
    if (edge === "top")    { position = [0, shift, offset]; rotation = [0, 0, Math.PI]; }
    if (edge === "bottom") { position = [0, -shift, offset]; rotation = [0, 0, 0]; }
    if (edge === "left")   { position = [-shift, 0, offset]; rotation = [0, 0, -Math.PI / 2]; }
    if (edge === "right")  { position = [shift, 0, offset]; rotation = [0, 0, Math.PI / 2]; }
  }
  else if (faceIndex === FACE_INDICES.ZNEG) {
    if (edge === "top")    { position = [0, shift, -offset]; rotation = [0, Math.PI, 0]; }
    if (edge === "bottom") { position = [0, -shift, -offset]; rotation = [0, Math.PI, Math.PI]; }
    if (edge === "left")   { position = [shift, 0, -offset]; rotation = [0, Math.PI, -Math.PI / 2]; }
    if (edge === "right")  { position = [-shift, 0, -offset]; rotation = [0, Math.PI, Math.PI / 2]; }
  }

  return (
    <mesh 
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation(); // Предотвращаем клик сквозь куб
        onClick();
      }}
    >
      <shapeGeometry args={[trapezoidShape]} />
      <meshBasicMaterial 
        color="black" 
        transparent 
        opacity={0.3} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </mesh>
  );
}

export default function CubeletWithControllers({ position, colors, cubeRef, logicalPos, onRotate }) {
  const [x, y, z] = logicalPos;

  const renderControllers = () => {
    const controllers = [];

    // --- ГРАНЬ XPOS (+X) ---
    if (x === 1) {
      if (y === 1)  controllers.push(<EdgeController key="xpos-t" faceIndex={FACE_INDICES.XPOS} edge="top" onClick={() => onRotate("z", z, Math.PI / 2)} />);
      if (y === -1) controllers.push(<EdgeController key="xpos-b" faceIndex={FACE_INDICES.XPOS} edge="bottom" onClick={() => onRotate("z", z, -Math.PI / 2)} />);
      if (z === -1) controllers.push(<EdgeController key="xpos-l" faceIndex={FACE_INDICES.XPOS} edge="left" onClick={() => onRotate("y", y, Math.PI / 2)} />);
      if (z === 1)  controllers.push(<EdgeController key="xpos-r" faceIndex={FACE_INDICES.XPOS} edge="right" onClick={() => onRotate("y", y, -Math.PI / 2)} />);
    }
    // --- ГРАНЬ XNEG (-X) ---
    if (x === -1) {
      if (y === 1)  controllers.push(<EdgeController key="xneg-t" faceIndex={FACE_INDICES.XNEG} edge="top" onClick={() => onRotate("z", z, -Math.PI / 2)} />);
      if (y === -1) controllers.push(<EdgeController key="xneg-b" faceIndex={FACE_INDICES.XNEG} edge="bottom" onClick={() => onRotate("z", z, Math.PI / 2)} />);
      if (z === 1)  controllers.push(<EdgeController key="xneg-l" faceIndex={FACE_INDICES.XNEG} edge="left" onClick={() => onRotate("y", y, Math.PI / 2)} />);
      if (z === -1) controllers.push(<EdgeController key="xneg-r" faceIndex={FACE_INDICES.XNEG} edge="right" onClick={() => onRotate("y", y, -Math.PI / 2)} />);
    }
    // --- ГРАНЬ YPOS (+Y) ---
    if (y === 1) {
      if (z === -1) controllers.push(<EdgeController key="ypos-t" faceIndex={FACE_INDICES.YPOS} edge="top" onClick={() => onRotate("x", x, Math.PI / 2)} />);
      if (z === 1)  controllers.push(<EdgeController key="ypos-b" faceIndex={FACE_INDICES.YPOS} edge="bottom" onClick={() => onRotate("x", x, -Math.PI / 2)} />);
      if (x === -1) controllers.push(<EdgeController key="ypos-l" faceIndex={FACE_INDICES.YPOS} edge="left" onClick={() => onRotate("z", z, -Math.PI / 2)} />);
      if (x === 1)  controllers.push(<EdgeController key="ypos-r" faceIndex={FACE_INDICES.YPOS} edge="right" onClick={() => onRotate("z", z, Math.PI / 2)} />);
    }
    // --- ГРАНЬ YNEG (-Y) ---
    if (y === -1) {
      if (z === 1)  controllers.push(<EdgeController key="yneg-t" faceIndex={FACE_INDICES.YNEG} edge="top" onClick={() => onRotate("x", x, Math.PI / 2)} />);
      if (z === -1) controllers.push(<EdgeController key="yneg-b" faceIndex={FACE_INDICES.YNEG} edge="bottom" onClick={() => onRotate("x", x, -Math.PI / 2)} />);
      if (x === -1) controllers.push(<EdgeController key="yneg-l" faceIndex={FACE_INDICES.YNEG} edge="left" onClick={() => onRotate("z", z, Math.PI / 2)} />);
      if (x === 1)  controllers.push(<EdgeController key="yneg-r" faceIndex={FACE_INDICES.YNEG} edge="right" onClick={() => onRotate("z", z, -Math.PI / 2)} />);
    }
    // --- ГРАНЬ ZPOS (+Z) ---
    if (z === 1) {
      if (y === 1)  controllers.push(<EdgeController key="zpos-t" faceIndex={FACE_INDICES.ZPOS} edge="top" onClick={() => onRotate("x", x, -Math.PI / 2)} />);
      if (y === -1) controllers.push(<EdgeController key="zpos-b" faceIndex={FACE_INDICES.ZPOS} edge="bottom" onClick={() => onRotate("x", x, Math.PI / 2)} />);
      if (x === -1) controllers.push(<EdgeController key="zpos-l" faceIndex={FACE_INDICES.ZPOS} edge="left" onClick={() => onRotate("y", y, -Math.PI / 2)} />);
      if (x === 1)  controllers.push(<EdgeController key="zpos-r" faceIndex={FACE_INDICES.ZPOS} edge="right" onClick={() => onRotate("y", y, Math.PI / 2)} />);
    }
    // --- ГРАНЬ ZNEG (-Z) ---
    if (z === -1) {
      if (y === 1)  controllers.push(<EdgeController key="zneg-t" faceIndex={FACE_INDICES.ZNEG} edge="top" onClick={() => onRotate("x", x, Math.PI / 2)} />);
      if (y === -1) controllers.push(<EdgeController key="zneg-b" faceIndex={FACE_INDICES.ZNEG} edge="bottom" onClick={() => onRotate("x", x, -Math.PI / 2)} />);
      if (x === 1)  controllers.push(<EdgeController key="zneg-l" faceIndex={FACE_INDICES.ZNEG} edge="left" onClick={() => onRotate("y", y, -Math.PI / 2)} />);
      if (x === -1) controllers.push(<EdgeController key="zneg-r" faceIndex={FACE_INDICES.ZNEG} edge="right" onClick={() => onRotate("y", y, Math.PI / 2)} />);
    }

    return controllers;
  };

  return (
    <group position={position} ref={cubeRef}>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {colors.map((color, i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={color} />
        ))}
      </mesh>
      {renderControllers()}
    </group>
  );
}
