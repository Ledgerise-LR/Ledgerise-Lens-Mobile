import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import CryptoJS from 'crypto-js';
import { AES_HASH_SECRET_KEY } from '@env';
import axios from 'axios';

export default function CameraPage({ route, navigate }) {

  const { tokenId, key } = route.params;

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [scannedData, setScannedData] = useState("");
  const [scanning, setScanning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [location, setLocation] = useState<object>({});

  const encryptEventData = (eventData: object) => {
    const encryptedMessage = CryptoJS.AES.encrypt(JSON.stringify(eventData), AES_HASH_SECRET_KEY).toString();
    return encryptedMessage;
  }

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

  useEffect(() => {
    (async () => {
      // Request permissions for accessing location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Handle permission denied
        return;
      }

      // Retrieve current location
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
    })();
  }, [scanning]);


  useEffect(() => {
    if (scannedData) {

      const qrCodeDataArr = scannedData.split("-");
      if (qrCodeDataArr.length != 4) {
        return Alert.alert("Data format doesn't meet requirements: ", scannedData);
      }

      if (selectedEvent == "") {
        return Alert.alert("Please select event type.", "Please specify the event type.");
      }

      const date = Date.now();

      const eventData = {
        key: selectedEvent,
        nftAddress: qrCodeDataArr[0],
        marketplaceTokenId: qrCodeDataArr[1],
        openseaTokenId: qrCodeDataArr[2],
        buyer: qrCodeDataArr[3],
        location: location,
        date: date.toString()
      }

      const sendPostRequest = async () => {
        try {
          const response = await fetch('http://192.168.1.16:4000/save-real-item-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: encryptEventData(eventData) }), // Replace with your request payload
          });

          if (response.ok) {
            // Request was successful
            const data = await response.json();
            if (data.err) {
              Alert.alert('Request not successful', scannedData);
              setScannedData("");

            } else if (data.activeItem) {

              Alert.alert('Operation successfully recorded', `Real item for NFT with tokenId ${eventData.openseaTokenId}, with owner ${eventData.buyer} is successfully recorded.`);
              setScannedData("");

            }
          } else {
            // Request failed
            console.log('Request failed with status:', response.status);
          }
        } catch (error) {
          console.log('Error:', error);
        }
      };

      sendPostRequest();
    }
  }, [scanning]);


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

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  interface BarcodeScannerData {
    type: string,
    data: string
  }

  const handleBarCodeScanned = ({ type, data }: BarcodeScannerData) => {
    setScannedData(data);
  };

  const toggleScanning = () => {
    setScanning(prevState => !prevState);
  }

  return (
    <View style={tw`w-full h-full`}>
      <Camera style={tw`w-full h-full`} type={type} onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}>
        <View style={tw`flex-1 flex p-8 justify-center items-center`}>
          <Text style={tw`flex-1 text-slate-50 text-lg font-bold`}>Searching for target product...</Text>
        </View>
      </Camera >
      <View style={tw`absolute bottom-0 h-12 w-full left-0 bg-slate-500/50 flex justify-center items-center`}>
        <Text style={tw`text-slate-50`}>{
          <Text>{calculateProductRecordInfoSpecificLocation(asset).targetKey} recorded out of {calculateProductRecordInfoSpecificLocation(asset).total} at {key.toUpperCase()} location</Text>
        }</Text>
      </View>
    </View >
  );
}
