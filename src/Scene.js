import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import Firework from "./Firework";

export default function Scene() {
  const [fireworks, setFireworks] = useState([]);

  const launchFirework = () => {
    setFireworks((prev) => [
      ...prev,
      {
        id: Math.random(),
        x: (Math.random() - 0.5) * 6, // разброс по горизонтали
      },
    ]);
  };

  return (
    <>
      {/* 🔘 КНОПКА */}
      <button
        onClick={launchFirework}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 10,
          padding: "12px 18px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "#111",
          color: "#fff",
        }}
      >
        💥 Запустить фейерверк
      </button>

      {/* 🎬 СЦЕНА */}
      <Canvas
        camera={{ position: [0, 0, 8] }}
        style={{
          position: "fixed",
          inset: 0,
          background: "black",
        }}
      >
        {fireworks.map((fw) => (
          <Firework key={fw.id} position={[fw.x, -5, 0]} />
        ))}
      </Canvas>
    </>
  );
}