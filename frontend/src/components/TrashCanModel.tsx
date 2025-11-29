import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Sparkles } from '@react-three/drei';
import { Suspense, useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function FloatingModel() {
  const { scene, nodes } = useGLTF('/trash-can.glb');
  console.log('GLTF Node Keys:', JSON.stringify(Object.keys(nodes)));
  const groupRef = useRef<THREE.Group>(null);

  // Exact GSAP Animation from Template
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      const can = groupRef.current!;
      
      // Initial State - Top Right (Lowered for visibility)
      can.rotation.y = -0.5;
      can.position.set(2.5, -1.0, 0);

      // 1. Move to Burn Section (Equivalent to #scent)
      // Glides to Bottom Left
      gsap.to(can.position, {
          x: -3.5,
          y: -3.0,
          z: 0,
          scrollTrigger: {
              trigger: "#burn",
              start: "top bottom",
              end: "bottom center",
              scrub: 1
          }
      });
      
      gsap.to(can.rotation, {
          y: 3.14, // Full spin
          scrollTrigger: {
              trigger: "#burn",
              start: "top bottom",
              end: "bottom center",
              scrub: 1
          }
      });

      // 2. Move to About Section (Equivalent to #tech)
      // Zoom in, spin
      const techTimeline = gsap.timeline({
          scrollTrigger: {
              trigger: "#about",
              start: "top bottom",
              end: "bottom center",
              scrub: 1
          }
      });

      techTimeline.to(can.position, { x: 0, y: 0, z: 3 }) // Zoom
                  .to(can.rotation, { x: 0.2, y: 6.28 }, "<"); // Spin

      // 3. Move to Features Section
      // Reset
      gsap.to(can.position, {
          y: -1,
          x: 0,
          z: 0,
          scrollTrigger: {
              trigger: "#features",
              start: "top bottom",
              end: "bottom center",
              scrub: 1
          }
      });

    }); // No scope needed for Three.js objects

    return () => ctx.revert();
  }, []);
  
  useEffect(() => {
    // Apply shiny metallic material to all meshes in the model
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Silver metallic trash can
        child.material = new THREE.MeshStandardMaterial({
          color: '#e0e0e0', // Silver/White metal
          metalness: 0.9,
          roughness: 0.15, // Shinier
          envMapIntensity: 1.2,
        });
        
        // Try to hide the lid by checking if mesh is near the top
        child.geometry.computeBoundingBox();
        const bbox = child.geometry.boundingBox;
        if (bbox) {
          const centerY = (bbox.max.y + bbox.min.y) / 2;
          if (centerY > 0.5) {
            child.visible = false;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={5} // Slightly smaller per request
      />
    </group>
  );
}

// Preload the model
useGLTF.preload('/trash-can.glb');

export default function TrashCanModel() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }} // Camera pos from template
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping, 
        }}
        onCreated={({ scene }) => {
          scene.fog = new THREE.FogExp2(0x050505, 0.05); // Fog from template
        }}
      >
        {/* Lighting from template */}
        <ambientLight intensity={0.4} color="#ffffff" />
        
        {/* Main Spotlight (Front-Left) */}
        <spotLight 
          position={[5, 10, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={2} 
          distance={50}
          decay={2}
          color="#ffffff"
        />
        
        {/* Rim Light (Back-Right - Cool Blue Tint) */}
        <spotLight 
          position={[-5, 5, -5]} 
          intensity={4} 
          color="#aaccff"
        />

        {/* Rim Light (Bottom - Warm tint) */}
        <pointLight position={[5, -5, 0]} intensity={1} color="#ffaa88" />
        
        <Suspense fallback={null}>
          <Environment preset="city" blur={1} background={false} />
          
          <FloatingModel />
          
          {/* Particles from template */}
          <Sparkles 
            count={100}
            scale={10}
            size={2}
            speed={0.2}
            opacity={0.5}
            color="#00ffcc"
          />

          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={false} // Disabled for manual control
            autoRotate={true} // Gentle idle spin when not scrolling
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
