import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Box3, Vector3, PerspectiveCamera } from 'three';

interface ViewerProps {
  url?: string; // If provided, attempt GLTF load
  mode?: 'procedural' | 'asset';
  autoRotate?: boolean;
  wireframe?: boolean;
}

function FitScene({ children }: { children: React.ReactNode }) {
  const group = useRef<any>();
  const { camera } = useThree();
  useEffect(() => {
    if (!group.current) return;
    const box = new Box3().setFromObject(group.current);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    if ((camera as PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as PerspectiveCamera;
      const fov = (persp.fov * Math.PI) / 180;
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.6; // padding factor
      camera.position.set(
        center.x + cameraZ * 0.5,
        center.y + cameraZ * 0.3,
        center.z + cameraZ * 0.5
      );
    } else {
      // Fallback for orthographic cameras (not expected in current config)
      const distance = maxDim * 2.0;
      camera.position.set(center.x + distance, center.y + distance, center.z + distance);
    }
    camera.lookAt(center);
  }, [camera]);
  return <group ref={group}>{children}</group>;
}

function ProceduralMesh({ wireframe, autoRotate }: { wireframe?: boolean; autoRotate?: boolean }) {
  const ref = useRef<any>();
  useFrame((_, d) => { if (autoRotate && ref.current) ref.current.rotation.y += d * 0.4; });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <torusKnotGeometry args={[0.9, 0.32, 96, 24]} />
      <meshStandardMaterial color="#6b5cff" roughness={0.35} metalness={0.2} wireframe={wireframe} />
    </mesh>
  );
}

function GLTFAsset({ url, wireframe, autoRotate }: { url: string; wireframe?: boolean; autoRotate?: boolean }) {
  const { scene } = useGLTF(url, true, true);
  const ref = useRef<any>();
  useEffect(() => {
    if (ref.current && wireframe) {
      ref.current.traverse((child: any) => {
        if (child.isMesh) child.material.wireframe = true;
      });
    }
  }, [wireframe]);
  useFrame((_, d) => { if (autoRotate && ref.current) ref.current.rotation.y += d * 0.3; });
  return <primitive ref={ref} object={scene} />;
}

export const ModelViewer3D: React.FC<ViewerProps> = ({ url, mode = 'procedural', autoRotate = true, wireframe }) => {
  return (
    <div className="relative h-[360px] w-full rounded-lg overflow-hidden border bg-[radial-gradient(circle_at_30%_30%,#1a1d23,#050607)]">
      <Canvas shadows dpr={[1, 1.5]} frameloop={autoRotate ? 'always' : 'demand'} camera={{ position: [3, 2, 3], fov: 45 }}>
        <color attach="background" args={["#0f1115"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Stage intensity={0.6} environment={null} adjustCamera={false}>
          <FitScene>
            <Suspense fallback={null}>
              {mode === 'asset' && url ? (
                <GLTFAsset url={url} wireframe={wireframe} autoRotate={autoRotate} />
              ) : (
                <ProceduralMesh wireframe={wireframe} autoRotate={autoRotate} />
              )}
            </Suspense>
          </FitScene>
        </Stage>
        <OrbitControls enablePan enableZoom enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
};

export default ModelViewer3D;
