import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural 3D Materials (Strict Monochrome Palette)
 */
const materials = {
  chrome: new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.95,
    roughness: 0.08,
  }),
  brushedMetal: new THREE.MeshStandardMaterial({
    color: '#d4d4d8',
    metalness: 0.85,
    roughness: 0.28,
  }),
  darkObsidian: new THREE.MeshStandardMaterial({
    color: '#18181b',
    metalness: 0.6,
    roughness: 0.2,
  }),
  matteGraphite: new THREE.MeshStandardMaterial({
    color: '#27272a',
    metalness: 0.25,
    roughness: 0.55,
  }),
  frostedGlass: new THREE.MeshPhysicalMaterial({
    color: '#f4f4f5',
    metalness: 0.1,
    roughness: 0.18,
    transmission: 0.65,
    thickness: 0.5,
    transparent: true,
    opacity: 0.9,
  }),
  softWhite: new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    metalness: 0.3,
    roughness: 0.25,
  }),
};

/**
 * 1. React Logo (Code / Frontend standard)
 * Central nucleus sphere with 3 intersecting elliptical orbital rings.
 * Medium size, chrome finish.
 */
function ReactCodeLogo({ reducedMotion }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (!reducedMotion && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0008) * 0.15;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.8}
      rotationIntensity={reducedMotion ? 0 : 0.35}
      floatIntensity={reducedMotion ? 0 : 0.5}
    >
      <group ref={meshRef} position={[0.2, 1.3, 0.1]} scale={0.75}>
        {/* Nucleus */}
        <mesh material={materials.chrome}>
          <sphereGeometry args={[0.18, 24, 24]} />
        </mesh>
        {/* Ring 1 */}
        <mesh rotation={[0, 0, 0]} material={materials.chrome}>
          <torusGeometry args={[0.62, 0.028, 16, 64]} />
        </mesh>
        {/* Ring 2 */}
        <mesh rotation={[0, Math.PI / 3, Math.PI / 6]} material={materials.chrome}>
          <torusGeometry args={[0.62, 0.028, 16, 64]} />
        </mesh>
        {/* Ring 3 */}
        <mesh rotation={[0, -Math.PI / 3, -Math.PI / 6]} material={materials.chrome}>
          <torusGeometry args={[0.62, 0.028, 16, 64]} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 2. Code Brackets: </>
 * Medium size, brushed metal.
 */
function CodeBrackets({ reducedMotion }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!reducedMotion && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.08;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.6}
      rotationIntensity={reducedMotion ? 0 : 0.3}
      floatIntensity={reducedMotion ? 0 : 0.45}
    >
      <group ref={groupRef} position={[-1.9, 1.7, -0.2]} scale={0.65}>
        {/* Left bracket < */}
        <group position={[-1.0, 0, 0]}>
          <mesh
            position={[-0.14, 0.32, 0]}
            rotation={[0, 0, 0.65]}
            material={materials.brushedMetal}
          >
            <boxGeometry args={[0.11, 0.78, 0.11]} />
          </mesh>
          <mesh
            position={[-0.14, -0.32, 0]}
            rotation={[0, 0, -0.65]}
            material={materials.brushedMetal}
          >
            <boxGeometry args={[0.11, 0.78, 0.11]} />
          </mesh>
        </group>

        {/* Slash / */}
        <mesh
          position={[0, 0, 0]}
          rotation={[0, 0, -0.42]}
          material={materials.chrome}
        >
          <boxGeometry args={[0.09, 1.15, 0.09]} />
        </mesh>

        {/* Right bracket > */}
        <group position={[1.0, 0, 0]}>
          <mesh
            position={[0.14, 0.32, 0]}
            rotation={[0, 0, -0.65]}
            material={materials.brushedMetal}
          >
            <boxGeometry args={[0.11, 0.78, 0.11]} />
          </mesh>
          <mesh
            position={[0.14, -0.32, 0]}
            rotation={[0, 0, 0.65]}
            material={materials.brushedMetal}
          >
            <boxGeometry args={[0.11, 0.78, 0.11]} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

/**
 * 3. Database / SQL Cylinder Stack (Backend & Data Logo)
 * 3 stacked cylinders with disk groove rims.
 */
function DatabaseStack({ reducedMotion }) {
  const dbRef = useRef();

  useFrame((_, delta) => {
    if (!reducedMotion && dbRef.current) {
      dbRef.current.rotation.y += delta * 0.2;
      dbRef.current.rotation.x = Math.sin(Date.now() * 0.0009) * 0.12 + 0.25;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.5}
      rotationIntensity={reducedMotion ? 0 : 0.25}
      floatIntensity={reducedMotion ? 0 : 0.4}
    >
      <group ref={dbRef} position={[1.8, 0.3, 0.1]} scale={0.65}>
        {/* Top Disk */}
        <mesh position={[0, 0.32, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        </mesh>
        {/* Middle Disk */}
        <mesh position={[0, 0, 0]} material={materials.brushedMetal}>
          <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        </mesh>
        {/* Bottom Disk */}
        <mesh position={[0, -0.32, 0]} material={materials.darkObsidian}>
          <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        </mesh>

        {/* Indicator status light on disk */}
        <mesh position={[0.48, 0.32, 0.22]} material={materials.softWhite}>
          <sphereGeometry args={[0.04, 16, 16]} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 4. Terminal Window (>_) (CLI / Shell Logo)
 */
function TerminalWindow({ reducedMotion }) {
  const terminalRef = useRef();
  const cursorRef = useRef();

  useFrame((state, delta) => {
    if (!reducedMotion && terminalRef.current) {
      terminalRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.2 + 0.25;
      terminalRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.25) * 0.1;
    }
    if (cursorRef.current) {
      cursorRef.current.visible = Math.floor(state.clock.elapsedTime * 2.5) % 2 === 0;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.4}
      rotationIntensity={reducedMotion ? 0 : 0.25}
      floatIntensity={reducedMotion ? 0 : 0.4}
    >
      <group ref={terminalRef} position={[1.7, 1.9, -0.3]} scale={0.65}>
        {/* Window Body */}
        <mesh material={materials.darkObsidian}>
          <boxGeometry args={[1.5, 1.05, 0.12]} />
        </mesh>

        {/* Top Header Bar */}
        <mesh position={[0, 0.4, 0.07]} material={materials.matteGraphite}>
          <boxGeometry args={[1.46, 0.2, 0.03]} />
        </mesh>

        {/* 3 Header Dots */}
        <mesh position={[-0.56, 0.4, 0.1]} material={materials.softWhite}>
          <circleGeometry args={[0.035, 16]} />
        </mesh>
        <mesh position={[-0.45, 0.4, 0.1]} material={materials.brushedMetal}>
          <circleGeometry args={[0.035, 16]} />
        </mesh>
        <mesh position={[-0.34, 0.4, 0.1]} material={materials.matteGraphite}>
          <circleGeometry args={[0.035, 16]} />
        </mesh>

        {/* Shell prompt chevron > */}
        <mesh
          position={[-0.42, 0.1, 0.07]}
          rotation={[0, 0, -0.65]}
          material={materials.chrome}
        >
          <boxGeometry args={[0.04, 0.14, 0.015]} />
        </mesh>
        <mesh
          position={[-0.42, -0.01, 0.07]}
          rotation={[0, 0, 0.65]}
          material={materials.chrome}
        >
          <boxGeometry args={[0.04, 0.14, 0.015]} />
        </mesh>

        {/* Blinking Cursor block _ */}
        <mesh ref={cursorRef} position={[-0.2, -0.04, 0.07]} material={materials.softWhite}>
          <boxGeometry args={[0.1, 0.03, 0.02]} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 5. Git-Branch / Commit Tree Graph (Version Control Logo)
 */
function GitBranchGraph({ reducedMotion }) {
  const graphRef = useRef();

  useFrame((state) => {
    if (!reducedMotion && graphRef.current) {
      graphRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3 - 0.15;
      graphRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.25) * 0.08;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.5}
      rotationIntensity={reducedMotion ? 0 : 0.3}
      floatIntensity={reducedMotion ? 0 : 0.4}
    >
      <group ref={graphRef} position={[-1.7, 0.4, 0.0]} scale={0.65}>
        {/* Main branch commit nodes */}
        <mesh position={[0, 0.8, 0]} material={materials.chrome}>
          <sphereGeometry args={[0.15, 24, 24]} />
        </mesh>
        <mesh position={[0, 0.0, 0]} material={materials.softWhite}>
          <sphereGeometry args={[0.15, 24, 24]} />
        </mesh>
        <mesh position={[0, -0.8, 0]} material={materials.chrome}>
          <sphereGeometry args={[0.15, 24, 24]} />
        </mesh>

        {/* Main branch connector trunk */}
        <mesh position={[0, 0, 0]} material={materials.matteGraphite}>
          <cylinderGeometry args={[0.035, 0.035, 1.6, 16]} />
        </mesh>

        {/* Feature branch commit node */}
        <mesh position={[0.6, 0.3, 0.08]} material={materials.frostedGlass}>
          <sphereGeometry args={[0.14, 24, 24]} />
        </mesh>

        {/* Branch curves */}
        <mesh
          position={[0.3, 0.15, 0.04]}
          rotation={[0, 0, -0.78]}
          material={materials.matteGraphite}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
        </mesh>
        <mesh
          position={[0.3, 0.55, 0.04]}
          rotation={[0, 0, 0.78]}
          material={materials.matteGraphite}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 6. Hash Symbol # (Code Comments / Preprocessor / C# Logo)
 */
function HashTagSymbol({ reducedMotion }) {
  const hashRef = useRef();

  useFrame((_, delta) => {
    if (!reducedMotion && hashRef.current) {
      hashRef.current.rotation.y += delta * 0.22;
      hashRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.7}
      rotationIntensity={reducedMotion ? 0 : 0.35}
      floatIntensity={reducedMotion ? 0 : 0.45}
    >
      <group
        ref={hashRef}
        position={[0.1, -0.4, 0.1]}
        rotation={[0, 0, -0.15]}
        scale={0.62}
      >
        {/* Horizontal bars */}
        <mesh position={[0, 0.2, 0]} material={materials.chrome}>
          <boxGeometry args={[0.85, 0.09, 0.09]} />
        </mesh>
        <mesh position={[0, -0.2, 0]} material={materials.chrome}>
          <boxGeometry args={[0.85, 0.09, 0.09]} />
        </mesh>

        {/* Vertical bars (tilted) */}
        <mesh position={[-0.2, 0, 0]} material={materials.brushedMetal}>
          <boxGeometry args={[0.09, 0.85, 0.09]} />
        </mesh>
        <mesh position={[0.2, 0, 0]} material={materials.brushedMetal}>
          <boxGeometry args={[0.09, 0.85, 0.09]} />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 7. Curly Braces { } (Syntax / Code Blocks)
 */
function CurlyBraces({ reducedMotion }) {
  const braceRef = useRef();

  useFrame((state) => {
    if (!reducedMotion && braceRef.current) {
      braceRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.35) * 0.2;
      braceRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.1;
    }
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.3}
      rotationIntensity={reducedMotion ? 0 : 0.2}
      floatIntensity={reducedMotion ? 0 : 0.4}
    >
      <group ref={braceRef} position={[1.5, -1.3, -0.2]} scale={0.65}>
        {/* Left Brace { */}
        <group position={[-0.6, 0, 0]}>
          <mesh position={[0, 0.34, 0]} material={materials.brushedMetal}>
            <boxGeometry args={[0.07, 0.48, 0.07]} />
          </mesh>
          <mesh position={[-0.07, 0.0, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
          <mesh position={[0, -0.34, 0]} material={materials.brushedMetal}>
            <boxGeometry args={[0.07, 0.48, 0.07]} />
          </mesh>
          <mesh position={[0.07, 0.58, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
          <mesh position={[0.07, -0.58, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
        </group>

        {/* Right Brace } */}
        <group position={[0.6, 0, 0]}>
          <mesh position={[0, 0.34, 0]} material={materials.brushedMetal}>
            <boxGeometry args={[0.07, 0.48, 0.07]} />
          </mesh>
          <mesh position={[0.07, 0.0, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
          <mesh position={[0, -0.34, 0]} material={materials.brushedMetal}>
            <boxGeometry args={[0.07, 0.48, 0.07]} />
          </mesh>
          <mesh position={[-0.07, 0.58, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
          <mesh position={[-0.07, -0.58, 0]} material={materials.chrome}>
            <boxGeometry args={[0.14, 0.07, 0.07]} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

/**
 * 8. Ambient floating shards (Clean, subtle, medium-small)
 */
function AmbientParticles({ reducedMotion }) {
  const particles = useMemo(() => {
    const items = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 6.5,
          (Math.random() - 0.5) * 5.5 + 0.6,
          (Math.random() - 0.5) * 3 - 0.8,
        ],
        scale: Math.random() * 0.09 + 0.04,
        type: i % 3 === 0 ? 'sphere' : i % 3 === 1 ? 'cube' : 'octahedron',
        material:
          i % 3 === 0
            ? materials.chrome
            : i % 3 === 1
            ? materials.darkObsidian
            : materials.brushedMetal,
        speed: Math.random() * 0.7 + 0.3,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <Float
          key={i}
          speed={reducedMotion ? 0 : p.speed}
          rotationIntensity={reducedMotion ? 0 : 0.6}
          floatIntensity={reducedMotion ? 0 : 0.5}
        >
          <mesh position={p.position} scale={p.scale} material={p.material}>
            {p.type === 'sphere' ? (
              <sphereGeometry args={[1, 12, 12]} />
            ) : p.type === 'cube' ? (
              <boxGeometry args={[1, 1, 1]} />
            ) : (
              <octahedronGeometry args={[1, 0]} />
            )}
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/**
 * Main FloatingObjects Group with Mouse Parallax
 */
export default function FloatingObjects({ mousePos, reducedMotion }) {
  const parallaxGroupRef = useRef();

  useFrame(() => {
    if (!reducedMotion && parallaxGroupRef.current) {
      parallaxGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        parallaxGroupRef.current.rotation.y,
        mousePos.current.x * 0.22,
        0.05
      );
      parallaxGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        parallaxGroupRef.current.rotation.x,
        -mousePos.current.y * 0.16,
        0.05
      );
    }
  });

  return (
    <group ref={parallaxGroupRef}>
      {/* 1. React Logo (Medium size, upper center) */}
      <ReactCodeLogo reducedMotion={reducedMotion} />

      {/* 2. Code Brackets </> (Upper left) */}
      <CodeBrackets reducedMotion={reducedMotion} />

      {/* 3. Database / SQL Stack (Mid right) */}
      <DatabaseStack reducedMotion={reducedMotion} />

      {/* 4. Terminal Window >_ (Top right) */}
      <TerminalWindow reducedMotion={reducedMotion} />

      {/* 5. Git Branch Graph (Mid left) */}
      <GitBranchGraph reducedMotion={reducedMotion} />

      {/* 6. Hash Symbol # (Center) */}
      <HashTagSymbol reducedMotion={reducedMotion} />

      {/* 7. Curly Braces { } (Lower right) */}
      <CurlyBraces reducedMotion={reducedMotion} />

      {/* 8. Ambient Particle Shards (Dispersed background) */}
      <AmbientParticles reducedMotion={reducedMotion} />
    </group>
  );
}
