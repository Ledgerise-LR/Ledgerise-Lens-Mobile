import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import CryptoJS from 'crypto-js';
import { SERVER_URL } from '@env';
import axios from 'axios';
import io from 'socket.io-client'
import React from 'react';
import { Svg, Rect } from "react-native-svg";

export default function CameraPage({ route, navigate }) {

  const { tokenId, key } = route.params;

  const [socket, setSocket] = useState(io(`http://192.168.1.14:4000/realtime`));
  const cameraRef = useRef(null)
  const captureInterval = 50  // ms

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  // const [tempImageData, setTempImageData] = useState("");

  const [rectX, setRectX] = useState(0);
  const [rectY, setRectY] = useState(0);
  const [rectW, setRectW] = useState(0);
  const [rectH, setRectH] = useState(0);

  const [foundStatus, setFoundStatus] = useState(false);

  const [isScanning, setIsScanning] = useState(true);

  setTimeout(() => {
    setIsScanning(true);
  }, 3000)

  const setupSocketListeners = async () => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    })

    socket.on("processedImage", (processedImageData: any) => {
      console.log(processedImageData)
      if (processedImageData["found_status"] == "false") {
        setRectX(0);
        setRectY(0);
        setRectW(0);
        setRectH(0);
        setFoundStatus(false);
      } else if (processedImageData["found_status"] == "true") {

        setFoundStatus(true);

        const x = processedImageData["coordinates_array"][0];
        const w = processedImageData["coordinates_array"][1];

        const y = processedImageData["coordinates_array"][2];
        const h = processedImageData["coordinates_array"][3];

        setRectX(x);
        setRectY(y);
        setRectW(w);
        setRectH(h);
      }
    })

    await cameraRef.current?.initializeAsync();
  }

  useEffect(() => {
    ;
  }, [foundStatus, rectX, rectY, rectW, rectH]);

  const sendImageChunks = async (socket: any, imageBase64: any) => {
    const chunkSize = 10000;
    for (let offset = 0; offset < imageBase64.length; offset += chunkSize) {
      const chunk = imageBase64.substring(offset, offset + chunkSize);
      socket.emit('cameraFrame', chunk);
    }
    socket.emit('cameraFrame', 'done');
  };

  const onCameraReady = async () => {
    try {
      if (cameraRef.current) {
        let photo = cameraRef.current!.takePictureAsync({ base64: true, quality: 0.25 });
        const base64 = (await photo);

        await sendImageChunks(socket, base64.base64);
      }
    } catch (error) {
      console.error('Error capturing and sending frame:', error);
    }
  };


  useEffect(() => {

    setupSocketListeners();

    let capInterval: any

    if (isScanning) {
      capInterval = setInterval(onCameraReady, 3000);
    }

    // Clean up the Socket.io connection when the component unmounts
    return () => {
      clearInterval(capInterval)
      socket.disconnect();
    };
  }, [isScanning]);


  const [asset, setAsset] = useState({
    history: [{
      key: ""
    }],
    real_item_history: [{
      key: ""
    }]
  });

  const calculateProductRecordInfoSpecificLocation = (targetAsset: any) => {

    let buyCount = 0;

    let targetKeyCount = 0;

    for (let i = 0; i < targetAsset.history.length; i++) {
      const eachHistory = targetAsset.history[i];
      if (eachHistory.key == "buy") {
        buyCount++;
      }
    }

    for (let i = 0; i < targetAsset.real_item_history.length; i++) {
      const eachRealItemEvent = targetAsset.real_item_history[i];
      if (eachRealItemEvent.key == key) {
        targetKeyCount++;
      }
    }


    return {
      total: buyCount,
      targetKey: targetKeyCount
    }
  }

  useEffect(() => {

    const url = `http://192.168.1.14:4000/get-asset?tokenId=${tokenId}`;

    axios.get(url)
      .then(res => {
        const data = res.data;
        setAsset(data.activeItem);
      })

  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={tw`w-full p-4`}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }


  return (
    <View style={tw`w-full h-full`}>
      <Camera
        style={tw`w-full h-full`}
        // flashMode={Camera.Constants.FlashMode.torch}
        type={type} ref={(ref) => {
          cameraRef.current = ref;
        }}>
        <View style={tw`w-full flex justify-center`}>
          {
            foundStatus
              ? (<Text style={tw`text-slate-100 text-xl bg-green-400 p-5 flex justify-center items-center`}>Found</Text>)
              : (<Text style={tw`text-slate-100 text-xl p-5 flex justify-center items-center`}>Searching for product...</Text>)
          }
        </View>

        <Svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <Rect
            x={rectX}
            y={rectY}
            width={rectW}
            height={rectH}
            stroke="green"
            strokeWidth="5"
            fill="transparent"
          />
        </Svg>

      </Camera >

      <View style={tw`absolute bottom-0 h-12 w-full left-0 bg-slate-500/50 flex justify-center items-center`}>
        <Text style={tw`text-slate-50`}>{
          <Text>{calculateProductRecordInfoSpecificLocation(asset).targetKey} recorded out of {calculateProductRecordInfoSpecificLocation(asset).total} at {key.toUpperCase()} location</Text>
        }</Text>
      </View>
    </View >
  );
}