

import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';

import axios from 'axios';
import React from 'react';


export default function Asset({ route, navigation }) {

  useEffect(() => {
    axios.get(`http://${process.env.SERVER_URL}/auth/authenticate-verifier`)
      .then((res) => {
        if (res.data.success && res.data.company) return { success: true, company: res.data.company };
        if (!res.data.success && res.data.err) return navigation.navigate("Welcome")
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const { tokenId } = route.params

  const [asset, setAsset] = useState({
    history: [{
      key: ""
    }],
    real_item_history: [{
      key: ""
    }]
  });

  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetImage, setAssetImage] = useState("");


  useEffect(() => {

    const url = `http://${process.env.SERVER_URL}/get-asset?tokenId=${tokenId}`;

    axios.get(url)
      .then(res => {
        const asset = res.data.activeItem;
        setAsset(asset);
        updateTokenUriFields(asset.tokenUri);
      })

  }, []);

  const updateTokenUriFields = (tokenUri: string) => {
    const tokenUriGateWayUrl = "https://ipfs.io/ipfs/" + tokenUri.split("ipfs://")[1];

    axios.get(tokenUriGateWayUrl)
      .then(res => {
        const asset = res.data;
        setAssetName(asset.name);
        setAssetDescription(asset.description);

        const imageGatewayUrl = "https://ipfs.io/ipfs/" + asset.image.split("ipfs://")[1];
        setAssetImage(imageGatewayUrl);
      })
      .catch(err => {
        console.error(err)
      })
  }

  const [stampDisabled, setStampDisabled] = useState(false);
  const [shippedDisabled, setShippedDisabled] = useState(false);
  const [deliveredDisabled, setDeliveredDisabled] = useState(false);

  const calculateProductRecordInfoEachLocation = (targetAsset: any) => {

    let buyCount = 0;
    let stampCount = 0;
    let shipCount = 0;
    let deliverCount = 0;

    for (let i = 0; i < targetAsset.history.length; i++) {
      const eachHistoryEvent = targetAsset.history[i];

      if (eachHistoryEvent.key == "buy") {
        buyCount++;
      }
    }

    for (let i = 0; i < targetAsset.real_item_history.length; i++) {
      for (let j = 0; j < targetAsset.real_item_history[i].length; j++) {
        const eachHistoryEvent = targetAsset.real_item_history[i][j];

        if (eachHistoryEvent.key == "stamp") {
          stampCount++;
        } else if (eachHistoryEvent.key == "shipped") {
          shipCount++;
        } else if (eachHistoryEvent.key == "delivered") {
          deliverCount++;
        }
      }
    }


    return {
      stamp: stampCount,
      shipped: shipCount,
      delivered: deliverCount,
      total: buyCount
    }
  }

  useEffect(() => {
    calculateProductRecordInfoEachLocation(asset).stamp >= calculateProductRecordInfoEachLocation(asset).total ? setStampDisabled(true) : setStampDisabled(false);
    calculateProductRecordInfoEachLocation(asset).shipped >= calculateProductRecordInfoEachLocation(asset).total ? setShippedDisabled(true) : setShippedDisabled(false);
    calculateProductRecordInfoEachLocation(asset).delivered >= calculateProductRecordInfoEachLocation(asset).total ? setDeliveredDisabled(true) : setDeliveredDisabled(false);
  }, [asset])


  return (
    <ScrollView style={tw`w-full h-full p-8`}>
      <View style={tw`h-56 aspect-square mb-4 border rounded-xl overflow-hidden`}>
        <Image
          style={tw`h-full w-full rounded-xl`}
          source={{
            uri: `${assetImage}` || "https://wallpaperaccess.com/full/187161.jpg",
          }}
        />
      </View>
      <Text># {tokenId}</Text>
      <Text style={tw`text-xl`}>{assetName}</Text>
      <Text style={tw`text-xs`}>{assetDescription}</Text>
      <Text style={tw`mt-5 text-lg`}>Pick the checkpoint location</Text>
      <View style={tw`mt-3 flex flex-row`}>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${stampDisabled ? `bg-slate-500` : ``}`} disabled={stampDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          key: "stamp"
        })}>
          <Text style={tw`text-slate-100`}>Üretim noktası</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${shippedDisabled ? `bg-slate-500` : ``}`} disabled={shippedDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          key: "shipped"
        })}>
          <Text style={tw`text-slate-100`}>Depo 1</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${deliveredDisabled ? `bg-slate-500` : ``}`} disabled={deliveredDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          key: "delivered"
        })}>
          <Text style={tw`text-slate-100`}>Teslim noktası</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
      </View>
      <View style={tw`w-full h-0.5 bg-slate-900 mt-5`}></View>
      <Text style={tw`text-lg`}>Item details</Text>
      <View>
        <Text style={tw`mb-2`}><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).stamp} stamped</Text> out of {calculateProductRecordInfoEachLocation(asset).total} item bought</Text>
        <Text style={tw`mb-2`}><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).shipped} shipped</Text> out of {calculateProductRecordInfoEachLocation(asset).total} item bought</Text>
        <Text><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).delivered} delivered</Text> out of {calculateProductRecordInfoEachLocation(asset).total} item bought</Text>
      </View>
    </ScrollView >
  );
}
