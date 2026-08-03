import * as THREE from "three";
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function Firework({ position = [0, -5, 0] }) {
  const rocketRef = useRef();
  const explosionRef = useRef();

  const [exploded, setExploded] = useState(false);

  // 🚀 скорость ракеты
  const velocity = useRef(new THREE.Vector3(0, 7, 0));

  // 💥 позиция взрыва (ВАЖНО: не через ref объекта)
  const explosionPosition = useRef(new THREE.Vector3());

  // 💥 opacity без ререндеров
  const opacityRef = useRef(1);

  const count = 400;

  // 💥 генерация частиц (ОДИН РАЗ)
  const { positions, velocities, colors } = useMemo(() => {
    const positions = [];
    const velocities = [];
    const colors = [];

    const palette = [
      new THREE.Color("#ff3b3b"),
      new THREE.Color("#ffd93b"),
      new THREE.Color("#3bff8f"),
      new THREE.Color("#3bb9ff"),
      new THREE.Color("#a93bff"),
    ];

    for (let i = 0; i < count; i++) {
      positions.push(0, 0, 0);

      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.2,
        Math.random() - 0.5
      ).normalize();

      const speed = Math.random() * 8 + 4;
      velocities.push(dir.x * speed, dir.y * speed, dir.z * speed);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors.push(c.r, c.g, c.b);
    }

    return {
      positions: new Float32Array(positions),
      velocities: new Float32Array(velocities),
      colors: new Float32Array(colors),
    };
  }, []);

  useFrame((_, delta) => {
    // 🚀 ФАЗА ВЗЛЁТА
    if (!exploded && rocketRef.current) {
      rocketRef.current.position.y += velocity.current.y * delta;

      // гравитация
      velocity.current.y -= 4 * delta;

      // момент взрыва
      if (velocity.current.y <= 0) {
        explosionPosition.current.copy(rocketRef.current.position);
        setExploded(true);
      }
    }

    // 💥 ФАЗА ВЗРЫВА
    if (exploded && explosionRef.current) {
      const pos = explosionRef.current.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        pos[i3] += velocities[i3] * delta;
        pos[i3 + 1] += velocities[i3 + 1] * delta;
        pos[i3 + 2] += velocities[i3 + 2] * delta;

        // гравитация
        velocities[i3 + 1] -= 6 * delta;

        // трение
        velocities[i3] *= 0.98;
        velocities[i3 + 1] *= 0.98;
        velocities[i3 + 2] *= 0.98;
      }

      explosionRef.current.geometry.attributes.position.needsUpdate = true;

      // затухание (БЕЗ setState)
      opacityRef.current = Math.max(opacityRef.current - delta * 0.5, 0);
      explosionRef.current.material.opacity = opacityRef.current;
    }
  });

  return (
    <>
      {/* 🚀 РАКЕТА */}
      {!exploded && (
        <mesh ref={rocketRef} position={position}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}

      {/* 💥 ВЗРЫВ */}
      {exploded && (
        <points ref={explosionRef} position={explosionPosition.current}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={positions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={colors}
              count={colors.length / 3}
              itemSize={3}
            />
          </bufferGeometry>

          <pointsMaterial
            size={0.25}
            vertexColors
            transparent
            opacity={1}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </>
  );
}