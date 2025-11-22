import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';

function Model() {
  const { scene } = useGLTF('/trash-can.glb');
  
  useEffect(() => {
    // Apply shiny metallic material to all meshes in the model
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#8b8b8b', // Grey metallic color
          metalness: 0.8,
          roughness: 0.2,
          emissive: '#404040',
          emissiveIntensity: 0.05,
        });
        
        // Try to hide the lid by checking if mesh is near the top
        // Get the bounding box to find vertical position
        child.geometry.computeBoundingBox();
        const bbox = child.geometry.boundingBox;
        if (bbox) {
          const centerY = (bbox.max.y + bbox.min.y) / 2;
          // If mesh is in upper portion (likely the lid), hide it
          if (centerY > 0.5) {
            child.visible = false;
          }
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      scale={3.5}
      position={[0, -1.2, 0]}
    />
  );
}

// Preload the model
useGLTF.preload('/trash-can.glb');

export default function TrashCanModel() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <directionalLight position={[-10, 10, 5]} intensity={1.5} />
        <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
        <spotLight position={[5, 5, 5]} angle={0.5} penumbra={1} intensity={2} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Model />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
