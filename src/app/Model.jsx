'use client'
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const VRMModel = () => {
  const { scene, camera } = useThree();
  const [currentVrm, setCurrentVrm] = useState(null);
  const vrmContainer = useRef();

  useEffect(() => {
    const loader = new GLTFLoader();

    // Register VRM loader plugin
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });

    // Load VRM model
    const loadVRM = async () => {
      const url = "/pink_anim_3.vrm"; // Replace with your VRM file path
      loader.load(
        url,
        (gltf) => {
          const vrm = gltf.userData.vrm;

          // Optimize VRM
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);

          // Add VRM to the scene
          if (currentVrm) {
            scene.remove(currentVrm.scene);
            VRMUtils.deepDispose(currentVrm.scene);
          }

          vrm.scene.traverse((obj) => {
            obj.frustumCulled = false; // Disable frustum culling
          });

          setCurrentVrm(vrm);
          vrmContainer.current = vrm;
          scene.add(vrm.scene);

          console.log("Loaded VRM", vrm);
        },
        (progress) => {
          console.log("Loading VRM...", Math.round((progress.loaded / progress.total) * 100), "%");
        },
        (error) => {
          console.error("Error loading VRM:", error);
        }
      );
    };

    loadVRM();

    return () => {
      if (currentVrm) {
        scene.remove(currentVrm.scene);
        VRMUtils.deepDispose(currentVrm.scene);
      }
    };
  }, [scene, camera, currentVrm]);

  return null;
};

const VRMViewer = () => {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 30 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <OrbitControls />
          {/* <VRMModel /> */}
    </Canvas>
  );
};

export default VRMViewer;
