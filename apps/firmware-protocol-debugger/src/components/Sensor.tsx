import { Canvas } from '@react-three/fiber';
import { SensorType } from '@slimevr/firmware-protocol';
import { SerializedQuaternion, SerializedSensor } from '@slimevr/firmware-protocol-debugger-shared';
import { FC, useEffect, useRef } from 'react';
import * as ThreeJS from 'three';

const SensorRenderable: FC<{ rotation: SerializedQuaternion }> = ({ rotation }) => {
  const ref = useRef<ThreeJS.Mesh | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.setRotationFromQuaternion(new ThreeJS.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]));
  }, [rotation]);

  return (
    <mesh ref={ref} scale={1}>
      <boxGeometry args={[2, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
};

export const SensorComponent: FC<{ sensor: SerializedSensor; sensorId: number | string }> = ({ sensor, sensorId }) => {
  return (
    <div className="rounded-md bg-dark-purple-400">
      <div className="flex mx-2 p-1">
        <span className="font-medium flex-1">Sensor ID: {sensorId}</span>
      </div>

      <hr className="border-dark-purple-100" />

      <p className="mx-2 font-xs">Type: {SensorType[sensor.type]}</p>

      <hr className="border-dark-purple-100" />

      {/* This div is needed, otherwise the canvas will grow in height infinitely */}
      <div>
        <Canvas>
          <ambientLight />
          <pointLight position={[-2, 0, 5]} />
          <SensorRenderable rotation={sensor.rotation} />
        </Canvas>
      </div>
    </div>
  );
};
