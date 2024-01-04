import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import tw from 'twrnc';
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import io from 'socket.io-client'
import React from 'react';
import { Svg, Rect } from "react-native-svg";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { URL, PORT } from '../serverConfig';

export default function CameraPage({ route, navigation }) {

  useEffect(() => {
    if (URL) {
      axios.get(`${URL}:${PORT}/auth/authenticate-verifier`)
        .then((res) => {
          if (res.data.success && res.data.company) {
            const url = `${URL}:${PORT}/get-asset?tokenId=${tokenId}`;

            axios.get(url)
              .then(res => {
                const data = res.data;
                setAsset(data.activeItem);
              })
            return { success: true, company: res.data.company }
          };
          if (!res.data.success && res.data.err) return navigation.navigate("Welcome")
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [URL, PORT])

  const { tokenId, key } = route.params;

  const [socket, setSocket] = useState(io(`${URL}:${PORT}/realtime`));
  const cameraRef = useRef(null)
  const captureInterval = 50  // ms

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  // const [tempImageData, setTempImageData] = useState("");

  const [rectX, setRectX] = useState(0);
  const [rectY, setRectY] = useState(0);
  const [rectW, setRectW] = useState(0);
  const [rectH, setRectH] = useState(0);

  const [isLocationSet, setIsLocationSet] = useState<Boolean>(false);

  const [location, setLocation] = useState<Object>({ latitude: 0, longitude: 0 });
  const [date, setDate] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<Boolean>(false);

  const [foundStatus, setFoundStatus] = useState<Boolean>(false);

  const [isScanning, setIsScanning] = useState<Boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<Boolean>(false);

  const [qrArrayLength, setQrArrayLength] = useState<number>(0);
  const [currentDonorIndex, setCurrentDonorIndex] = useState<number>(0);

  const [isAlreadyVerified, setIsAlreadyVerified] = useState<Boolean>(false);
  const [isErrorOccured, setIsErrorOccured] = useState<Boolean>(false);
  const [isUploadInProgress, setIsUploadInProgress] = useState<Boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<Boolean>(false);
  const [incompatibleData, setIncompatibleData] = useState<Boolean>(false);

  const [isSocketListenersSet, setIsSocketListenersSet] = useState<Boolean>(false);

  const [scannedQrData, setScannedQrData] = useState<String>("");

  setTimeout(() => {
    setIsScanning(true);
  }, 2000)

  const setupSocketListeners = async () => {

    socket.on("connect", async () => {
      console.log("Connected to the server");
      const { coords } = await Location.getCurrentPositionAsync({});
      const date = Date.now();

      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      setDate(date);
      setIsLocationSet(true);
    })

    socket.on("disconnect", () => {
      setIsLocationSet(false);
      console.log("Disconnected from the server");
    })

    socket.on("processedImage", async (processedImageData: any) => {
      setIsAlreadyVerified(false);
      setIsErrorOccured(false);

      // console.log(processedImageData);

      if (processedImageData["found_status"] == "false") {
        setRectX(0);
        setRectY(0);
        setRectW(0);
        setRectH(0);
        setFoundStatus(false);
        setIsProcessing(false);
      } else if (processedImageData["found_status"] == "true") {

        setFoundStatus(true);
        setScannedQrData("");

        const x = processedImageData["coordinates_array"][0];
        const w = processedImageData["coordinates_array"][1];

        const y = processedImageData["coordinates_array"][2];
        const h = processedImageData["coordinates_array"][3];

        setRectX(x);
        setRectY(y);
        setRectW(w);
        setRectH(h);

        setIsUploadInProgress(true);

        socket.on("upload", async (data: string) => {

          const message = data.split("-")[0];
          const donorIndex = parseInt(data.split("-")[1]);
          const lengthOfQrArray = parseInt(data.split("-")[2]);

          setCurrentDonorIndex(donorIndex + 1);

          if ((donorIndex + 1) == lengthOfQrArray) {
            return setIsProcessing(false);
          }

          if (message == "error") return setIsErrorOccured(true);
          else if (message == "already_verified") return setIsAlreadyVerified(true);
          else if (message == "incompatible_data") return setIncompatibleData(true);
          else if (message == "complete") {
            setIsUploadInProgress(false)
            setIsUploadComplete(true)
          };
        })
      }
    })

    // await cameraRef.current?.initializeAsync();
  }

  useEffect(() => {
    ;
  }, [foundStatus, rectX, rectY, rectW, rectH, currentDonorIndex]);

  useEffect(() => {
    ;
  }, [isAlreadyVerified, isErrorOccured, isUploadComplete, isUploadInProgress, isLocationSet, isProcessing, qrArrayLength]);

  const sendImageChunks = async (socket: any, imageBase64: any, scannedData: string) => {
    if (imageBase64.length <= 0) return setIsProcessing(false);
    const chunkSize = 2048;
    for (let offset = 0; offset < imageBase64.length; offset += chunkSize) {
      const chunk = await imageBase64.substring(offset, offset + chunkSize);
      await socket.emit('cameraFrame', chunk);
    }


    await socket.emit('cameraFrame', {
      socketCallKey: "locationAndDate",
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      date: date.toString(),
      key: key,
      user_info: scannedData.toString()
    })

    await socket.emit('cameraFrame', 'done');
  };

  const onCameraReady = async (scannedData: string) => {
    try {
      if (cameraRef.current) {
        const length = JSON.parse(scannedData.split("-")[1]).length;
        setQrArrayLength(length);
        let photo = cameraRef.current!.takePictureAsync({ quality: 0.01, skipProcessing: true });
        const image = (await photo);

        const width: number = Dimensions.get("window").width;
        const height: number = (Dimensions.get("window").height) * 0.8;

        const compressedImage = await manipulateAsync(
          image.uri,
          [{ resize: { width: width, height: height } }],
          { compress: 0.0, base64: true }
        )

        await sendImageChunks(socket, compressedImage.base64, scannedData);
      }
    } catch (error) {
      console.log('Error capturing and sending frame:', error);
    }
  };


  useEffect(() => {
    if (!isSocketListenersSet) {
      setupSocketListeners();
      setIsSocketListenersSet(true);
    }

  }, [isSocketListenersSet]);


  useEffect(() => {

    let capInterval: any

    if (isScanning) {
      capInterval = setInterval(() => { ; }, 1000);

      return () => {
        clearInterval(capInterval)
        socket.disconnect();
        setIsSocketListenersSet(false);
      };
    }
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
      for (let j = 0; j < targetAsset.real_item_history[i].length; j++) {
        const eachRealItemEvent = targetAsset.real_item_history[i][j];
        if (eachRealItemEvent.key == key) {
          targetKeyCount++;
        }
      }
    }


    return {
      total: buyCount,
      targetKey: targetKeyCount
    }
  }

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
        }}
        onBarCodeScanned={async (e) => {
          if (!isProcessing && location.latitude != 0 && location.longitude != 0) {
            if (e.data) {
              setIsProcessing(true);
              setScannedQrData(e.data);
              await onCameraReady(e.data);
            } else {
              setIsProcessing(false);
            }
          }
        }}>
        <View style={tw`w-full flex justify-center`}>
          {
            foundStatus
              ? isErrorOccured
                ? (<Text style={tw`text-slate-100 p-5 flex justify-center items-center`}>Found: an error occured. ({currentDonorIndex} / {qrArrayLength})</Text>)
                : isAlreadyVerified
                  ? (<Text style={tw`text-slate-100 bg-blue-400 p-5 flex justify-center items-center`}>Found: but already verified. ({currentDonorIndex} / {qrArrayLength})</Text>)
                  : incompatibleData
                    ? (<Text style={tw`text-slate-100 bg-red-400 p-5 flex justify-center items-center`}>Found: but incompatible data. ({currentDonorIndex} / {qrArrayLength})</Text>)
                    : isUploadInProgress
                      ? (<Text style={tw`text-slate-100 bg-green-600 p-5 flex justify-center items-center`}>Found: upload in progress. ({currentDonorIndex} / {qrArrayLength})</Text>)
                      : isUploadComplete
                        ? (<Text style={tw`text-slate-100 bg-green-400 p-5 flex justify-center items-center`}>Found: upload complete, item verified! ({currentDonorIndex} / {qrArrayLength})</Text>)
                        : (<Text style={tw`text-slate-100 text-xl bg-green-400 p-5 flex justify-center items-center`}>Found</Text>)
              : isLocationSet
                ? isProcessing
                  ? (<Text style={tw`text-slate-800 bg-orange-500 p-5 flex justify-center items-center`}>Analyzing... Please wait.</Text>)
                  : (<Text style={tw`text-slate-100 p-5 flex justify-center items-center`}>Searching for product...</Text>)
                : (<Text style={tw`bg-yellow-500 text-slate-800 p-5 flex justify-center items-center`}>Fetching location, please wait.</Text>)

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