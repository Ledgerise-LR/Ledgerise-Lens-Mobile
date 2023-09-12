import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as Location from 'expo-location';
import CryptoJS from 'crypto-js';
import { AES_HASH_SECRET_KEY } from '@env';
import axios from 'axios';
import io from 'socket.io-client'

export default function CameraPage({ route, navigate }) {

  const { tokenId, key } = route.params;

  const [socket, setSocket] = useState(io('http://192.168.1.14:4000/realtime'));
  const [processedImage, setProcessedImage] = useState(null);
  const cameraRef = useRef(null)
  const captureInterval = 50  // ms

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const setupSocketListeners = async () => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    })

    socket.on("processedImage", (processedImageData) => {
      setProcessedImage(processedImageData);
    })
  }
  useEffect(() => {

    setupSocketListeners();

    // Callback for when the camera is ready
    const onCameraReady = async () => {
      try {
        if (cameraRef.current) {
          let photo = cameraRef.current!.takePictureAsync({ base64: true });
          socket.emit('cameraFrame', photo.base64);
        }
      } catch (error) {
        console.error('Error capturing and sending frame:', error);
      }
    };

    const capInterval = setInterval(onCameraReady, 1000)

    // Clean up the Socket.io connection when the component unmounts
    return () => {
      clearInterval(capInterval)
      socket.disconnect();
    };
  }, []);


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
      <Camera style={tw`w-full h-72`} type={type} ref={(ref) => {
        cameraRef.current = ref;
      }}>

      </Camera >
      {processedImage && (
        <Image
          source={{ uri: `data:image/png;base64,${processedImage}` }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <View style={tw`absolute bottom-0 h-12 w-full left-0 bg-slate-500/50 flex justify-center items-center`}>
        <Text style={tw`text-slate-50`}>{
          <Text>{calculateProductRecordInfoSpecificLocation(asset).targetKey} recorded out of {calculateProductRecordInfoSpecificLocation(asset).total} at {key.toUpperCase()} location</Text>
        }</Text>
      </View>
    </View >
  );
}
