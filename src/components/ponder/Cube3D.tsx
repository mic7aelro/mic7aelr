'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { invertAlg, moveGeometry, stickerCoordinates, stickerNormal, type Face } from '@/lib/cube';
import styles from '@/app/ponder/Ponder.module.css';

const COLORS: Record<Face, string> = {
  U: '#f5f5f0', D: '#f3c918', F: '#21a35d', B: '#2c66d6', R: '#d5352d', L: '#f27f1c',
};

const SPACING = 1.04;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface Animation {
  axis: THREE.Vector3;
  radians: number;
  start: number;
  duration: number;
  target: string;
  attached: THREE.Object3D[];
}

interface ModelProps {
  states: string[];
  moves: string[];
  index: number;
  /** Length of one turn in milliseconds. */
  duration: number;
}

function CubeModel({ states, moves, index, duration }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  const turning = useRef<THREE.Group>(null);
  const stickers = useRef<THREE.Mesh[]>([]);
  const bodies = useRef<THREE.Object3D[]>([]);
  const animation = useRef<Animation | null>(null);
  const shown = useRef(index);
  const shownStates = useRef<string[] | null>(null);

  const paint = (state: string) => {
    stickers.current.forEach((mesh, position) => {
      (mesh.material as THREE.MeshStandardMaterial).color.set(COLORS[state[position] as Face]);
    });
  };

  const finish = () => {
    const current = animation.current;
    if (!current || !root.current || !turning.current) return;
    turning.current.quaternion.identity();
    for (const piece of current.attached) {
      root.current.add(piece);
      piece.position.copy(piece.userData.home as THREE.Vector3);
      piece.quaternion.copy(piece.userData.homeQuaternion as THREE.Quaternion);
    }
    paint(current.target);
    animation.current = null;
  };

  // Build the 27 cubie bodies and the 54 stickers once.
  useLayoutEffect(() => {
    const group = root.current;
    if (!group) return undefined;
    const created: THREE.Object3D[] = [];

    const store = (object: THREE.Object3D) => {
      object.userData.home = object.position.clone();
      object.userData.homeQuaternion = object.quaternion.clone();
    };

    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.97, 0.97, 0.97),
            new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.7, metalness: 0.1 }),
          );
          body.position.set(x * SPACING, y * SPACING, z * SPACING);
          body.userData.coords = [x, y, z];
          store(body);
          group.add(body);
          bodies.current.push(body);
          created.push(body);
        }
      }
    }

    const geometry = new THREE.PlaneGeometry(0.84, 0.84);
    for (let index54 = 0; index54 < 54; index54 += 1) {
      const coordinates = stickerCoordinates(index54);
      const normal = stickerNormal(index54);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0, side: THREE.DoubleSide }));
      const direction = new THREE.Vector3(normal[0], normal[1], normal[2]);
      mesh.position.set(
        coordinates[0] * SPACING + direction.x * 0.49,
        coordinates[1] * SPACING + direction.y * 0.49,
        coordinates[2] * SPACING + direction.z * 0.49,
      );
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      mesh.userData.coords = [...coordinates];
      store(mesh);
      group.add(mesh);
      stickers.current[index54] = mesh;
      created.push(mesh);
    }

    return () => {
      for (const object of created) {
        group.remove(object);
        if (object instanceof THREE.Mesh) {
          (object.material as THREE.Material).dispose();
          if (object.geometry !== geometry) object.geometry.dispose();
        }
      }
      geometry.dispose();
      stickers.current = [];
      bodies.current = [];
    };
  }, []);

  // Follow the playback position. One step forward or back animates. Any other jump snaps.
  useEffect(() => {
    if (stickers.current.length === 0) return;
    finish();
    const previous = shown.current;
    const sameRun = shownStates.current === states;
    shownStates.current = states;
    shown.current = index;

    const turn = sameRun ? index - previous : 0;
    const move = turn === 1 ? moves[previous] : turn === -1 ? invertAlg([moves[index]])[0] : null;
    if (!move || duration <= 0 || !turning.current) {
      paint(states[index]);
      return;
    }

    const { axis, layers, turns } = moveGeometry(move);
    const vector = new THREE.Vector3(axis[0], axis[1], axis[2]);
    const attached: THREE.Object3D[] = [];
    for (const piece of [...bodies.current, ...stickers.current]) {
      const coords = piece.userData.coords as number[];
      const along = coords[0] * axis[0] + coords[1] * axis[1] + coords[2] * axis[2];
      if (layers.includes(along)) {
        turning.current.add(piece);
        attached.push(piece);
      }
    }
    paint(states[previous]);
    animation.current = {
      axis: vector,
      radians: -turns * (Math.PI / 2),
      start: performance.now(),
      duration,
      target: states[index],
      attached,
    };
  }, [index, states, moves, duration]);

  useFrame(() => {
    const current = animation.current;
    if (!current || !turning.current) return;
    const progress = Math.min(1, (performance.now() - current.start) / current.duration);
    turning.current.quaternion.setFromAxisAngle(current.axis, current.radians * easeInOut(progress));
    if (progress >= 1) finish();
  });

  return (
    <>
      <group ref={root} />
      <group ref={turning} />
    </>
  );
}

interface Props {
  states: string[];
  moves: string[];
  index: number;
  duration: number;
}

export default function Cube3D({ states, moves, index, duration }: Props) {
  return (
    <div className={styles.viewport3d}>
      <Canvas camera={{ position: [5.2, 4.6, 6.4], fov: 38 }} dpr={[1, 2]}>
        <ambientLight intensity={1.15} />
        <directionalLight position={[6, 9, 7]} intensity={1.7} />
        <directionalLight position={[-6, -4, -5]} intensity={0.55} />
        <CubeModel states={states} moves={moves} index={index} duration={duration} />
        <OrbitControls enablePan={false} minDistance={6} maxDistance={16} rotateSpeed={0.9} />
      </Canvas>
    </div>
  );
}
