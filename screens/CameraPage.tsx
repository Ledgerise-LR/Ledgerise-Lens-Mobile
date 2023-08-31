import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import CryptoJS from 'crypto-js';
import { AES_HASH_SECRET_KEY } from '@env';

export default function CameraPage() {
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
      <View style={styles.container}>
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
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}>
        <View style={tw`flex-1 flex p-16 justify-center items-center`}>
          <Text style={tw`flex-1 text-slate-50 text-2xl font-bold`}>Select Event</Text>
          <View style={tw`flex flex-1 flex-row -mt-20`}>
            <TouchableOpacity style={tw`mr-5`} onPress={() => setSelectedEvent("stamp")}>
              <Text style={tw`flex-1 text-lg font-bold font-bold text-slate-50`}>Stamped</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`mr-5`} onPress={() => setSelectedEvent("shipped")}>
              <Text style={tw`flex-1 text-slate-50 text-lg font-bold`}>Shipped</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedEvent("delivered")}>
              <Text style={tw`flex-1 text-slate-50 text-lg font-bold`}>Delivered</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleScanning}>
            <Text style={styles.text}>{scanning ? 'Stop Scanning' : 'Start Scanning'}</Text>
          </TouchableOpacity>
        </View>
      </Camera >
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdownContainer: {
    width: 200,
    height: 40,
  },
  dropdown: {
    backgroundColor: '#fafafa',
  },
  dropdownItem: {
    justifyContent: 'flex-start',
  },
  dropdownDropdown: {
    backgroundColor: '#fafafa',
  }
});