import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import FloatingObjects from './FloatingObjects';

/**
 * Three.js Scene Component
 * Renders the monochrome 3D tech universe with soft studio lighting,
 * mouse parallax, and performance optimizations.
 */
export default function Scene() {
  const mousePos = useRef({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user's OS preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Mouse movement parallax listener
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mousePos.current = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: (e.clientY / innerHeight) * 2 - 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0.4, 7.5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Subtle Fog for Depth Separation */}
        <fog attach="fog" args={['#0a0a0a', 7, 18]} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.45} />

        {/* Key Light */}
        <directionalLight
          position={[6, 8, 5]}
          intensity={1.4}
          color="#ffffff"
          castShadow={false}
        />

        {/* Rim Light for Crisp Metallic Edges */}
        <directionalLight
          position={[-6, -4, -3]}
          intensity={0.9}
          color="#e4e4e7"
        />

        {/* Soft Point Fill */}
        <pointLight position={[0, -2, 3]} intensity={0.4} color="#a1a1aa" />

        {/* City Environment map for realistic chrome & glass reflections */}
        <Environment preset="city" />

        {/* Floating Objects Group */}
        <FloatingObjects mousePos={mousePos} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
