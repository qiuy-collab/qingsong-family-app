import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type AssistantAvatarStatus = 'loading' | 'ready' | 'fallback';

interface AssistantAvatar3DProps {
  active?: boolean;
  onOpen: () => void;
  onStatusChange?: (status: AssistantAvatarStatus) => void;
}

const MODEL_URL = new URL('../model/base_basic_shaded.glb', import.meta.url).href;

class ModelErrorBoundary extends React.Component<
  {
    fallback: React.ReactNode;
    onError: () => void;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface ModelSceneProps {
  active: boolean;
  gestureToken: number;
  onReady: () => void;
}

const ModelScene: React.FC<ModelSceneProps> = ({ active, gestureToken, onReady }) => {
  const { scene } = useGLTF(MODEL_URL);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const anchorRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const triggerRef = useRef(gestureToken);
  const waveTimerRef = useRef(0);

  useLayoutEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.42 / maxAxis;

    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -center.y * scale - 0.1, -center.z * scale);
  }, [clonedScene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    if (gestureToken !== triggerRef.current) {
      triggerRef.current = gestureToken;
      waveTimerRef.current = 0.92;
    }
  }, [gestureToken]);

  useFrame((state, delta) => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const t = state.clock.getElapsedTime();
    const idleLift = Math.sin(t * 2.2) * 0.06;
    const idleTurn = Math.sin(t * 1.1) * 0.09;
    const idleTilt = Math.sin(t * 1.8) * 0.025;

    let extraLift = 0;
    let extraTurn = 0;
    let extraTilt = 0;
    let scaleX = 1;
    let scaleY = 1;

    if (active) {
      const talk = Math.sin(t * 8.4);
      extraLift += talk * 0.02;
      extraTurn += Math.sin(t * 3.6) * 0.03;
      scaleX += talk * 0.016;
      scaleY += Math.cos(t * 8.4) * 0.022;
    }

    if (waveTimerRef.current > 0) {
      waveTimerRef.current = Math.max(0, waveTimerRef.current - delta);
      const progress = 1 - waveTimerRef.current / 0.92;
      const envelope = 1 - progress;
      extraLift += Math.sin(progress * Math.PI * 2.6) * 0.11 * envelope;
      extraTurn += Math.sin(progress * Math.PI * 3.2) * 0.28 * envelope;
      extraTilt += Math.sin(progress * Math.PI * 4.2) * 0.12 * envelope;
    }

    anchor.position.y = idleLift + extraLift;
    anchor.rotation.y = idleTurn + extraTurn;
    anchor.rotation.z = idleTilt + extraTilt;
    anchor.scale.set(scaleX, scaleY, 1);
  });

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[2.8, 4, 3]} intensity={2.35} />
      <group ref={anchorRef}>
        <group ref={modelRef}>
          <primitive object={clonedScene} />
        </group>
      </group>
    </>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
  </div>
);

const StaticFallback: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="relative flex h-full w-full items-end justify-center bg-transparent"
    aria-label="打开松小暖助手"
  >
    <div className="absolute bottom-2 h-6 w-14 rounded-full bg-slate-900/10 blur-md" />
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
      <span className="material-symbols-outlined fill-icon text-primary">smart_toy</span>
    </div>
  </button>
);

const AssistantAvatar3D: React.FC<AssistantAvatar3DProps> = ({ active = false, onOpen, onStatusChange }) => {
  const [status, setStatus] = useState<AssistantAvatarStatus>('loading');
  const [gestureToken, setGestureToken] = useState(0);

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  const handleReady = useCallback(() => {
    setStatus('ready');
  }, []);

  const handleError = useCallback(() => {
    setStatus('fallback');
  }, []);

  const handleOpen = useCallback(() => {
    setGestureToken((value) => value + 1);
    onOpen();
  }, [onOpen]);

  if (status === 'fallback') {
    return <StaticFallback onOpen={handleOpen} />;
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="relative block h-full w-full cursor-pointer bg-transparent"
      aria-label="打开松小暖助手"
    >
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-7 w-16 -translate-x-1/2 rounded-full bg-slate-900/12 blur-md" />
      <Canvas camera={{ position: [0, 0.18, 4.2], fov: 22 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ModelErrorBoundary fallback={null} onError={handleError}>
          <Suspense fallback={null}>
            <ModelScene active={active} gestureToken={gestureToken} onReady={handleReady} />
          </Suspense>
        </ModelErrorBoundary>
      </Canvas>

      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0">
          <LoadingFallback />
        </div>
      )}
    </button>
  );
};

useGLTF.preload(MODEL_URL);

export default AssistantAvatar3D;
