import { Canvas } from '@react-three/fiber';
import { SensorStatus, SensorType } from '@slimevr/firmware-protocol';
import { SerializedQuaternion, SerializedSensor } from '@slimevr/firmware-protocol-debugger-shared';
import React from 'react';
import * as ThreeJS from 'three';

const SensorRenderable: React.FC<{ rotation: SerializedQuaternion }> = ({ rotation }) => {
  const ref = React.useRef<ThreeJS.Mesh | null>(null);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.setRotationFromQuaternion(new ThreeJS.Quaternion(rotation[0], rotation[1], rotation[2], rotation[3]));
  }, [rotation]);

  return (
    <mesh ref={ref} scale={1}>
      <boxGeometry args={[2, 1, 1]} />

      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-0" color="#00FF00" />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-1" color="#FF0000" />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-2" color="#0000FF" />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-3" color="#FFFF00" />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-4" color="#FF00FF" />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <meshBasicMaterial attach="material-5" color="#00FFFF" />
    </mesh>
  );
};

export const SensorComponent: React.FC<{ sensor: SerializedSensor; sensorId: number | string }> = ({
  sensor,
  sensorId
}) => {
  return (
    <div className="rounded-md bg-dark-purple-400">
      <div className="flex mx-2 p-1">
        <span className="font-medium flex-1">Sensor ID: {sensorId}</span>
      </div>

      <hr className="border-dark-purple-100" />

      <p className="mx-2 font-xs">Type: {SensorType[sensor.type]}</p>
      <p className="mx-2 font-xs">Status: {SensorStatus[sensor.status]}</p>
      <p className="mx-2 font-xs">Magnetometer Accuracy: {sensor.magnetometerAccuracy.toFixed(1)}</p>
      <p className="mx-2 font-xs">Temperature: {sensor.temperature.toFixed(1)}</p>

      <hr className="border-dark-purple-100" />

      {/* This div is needed, otherwise the canvas will grow in height infinitely */}
      <div>
        <Canvas>
          <ambientLight />
          {/* eslint-disable-next-line react/no-unknown-property */}
          <pointLight position={[0, 5, 0]} castShadow={true} intensity={10} />
          <SensorRenderable rotation={sensor.rotation} />
        </Canvas>
      </div>
    </div>
  );
};
