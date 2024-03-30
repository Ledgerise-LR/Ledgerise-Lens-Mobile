

import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import { URL, PORT } from '../serverConfig';
import axios from 'axios';
import React from 'react';


export default function Asset({ route, navigation }) {

  const { tokenId, subcollectionId, nftAddress } = route.params

  useEffect(() => {
    if (URL) {
      axios.get(`${URL}:${PORT}/auth/authenticate-verifier`)
        .then((res) => {
          if (res.data.success && res.data.company) {
            const url = `${URL}:${PORT}/get-asset?tokenId=${tokenId}&subcollectionId=${subcollectionId}&nftAddress=${nftAddress}`;

            axios.get(url)
              .then(res => {
                const asset = res.data.activeItem;
                setAsset(asset);
                updateTokenUriFields(asset.tokenUri);
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
    let shippedCount = 0;
    let deliveredCount = 0;


    for (let i = 0; i < targetAsset.history.length; i++) {
      const eachHistoryEvent = targetAsset.history[i];

      if (eachHistoryEvent.key == "buy") {
        buyCount++;
      }
    }

    const realItemHistoryMap = {};

    for (let i = 0; i < targetAsset.real_item_history.length; i++) {
      for (let j = 0; j < targetAsset.real_item_history[i].length; j++) {
        const eachHistoryEvent = targetAsset.real_item_history[i][j];

        if (realItemHistoryMap[eachHistoryEvent.openseaTokenId] == undefined) {
          realItemHistoryMap[eachHistoryEvent.openseaTokenId] = {};
        }

        if (realItemHistoryMap[eachHistoryEvent.openseaTokenId][eachHistoryEvent.key] == undefined) {
          realItemHistoryMap[eachHistoryEvent.openseaTokenId][eachHistoryEvent.key] = true;
          if (eachHistoryEvent.key == "stamp") {
            stampCount++;
          } else if (eachHistoryEvent.key == "shipped") {
            shippedCount++;
          } else if (eachHistoryEvent.key == "delivered") {
            deliveredCount++;
          }
        }
      }
    }


    return {
      stamp: stampCount,
      shipped: shippedCount,
      delivered: deliveredCount,
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
      <Text style={tw`mt-5 text-lg`}>Koli hangi noktada?</Text>
      <View style={tw`mt-3 flex flex-row`}>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${stampDisabled ? `bg-slate-500` : ``}`} disabled={stampDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          subcollectionId: asset.subcollectionId,
          key: "stamp",
          nftAddress: nftAddress
        })}>
          <Text style={tw`text-slate-100`}>Üretim noktası</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${shippedDisabled ? `bg-slate-500` : ``}`} disabled={shippedDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          subcollectionId: asset.subcollectionId,
          key: "shipped",
          nftAddress: nftAddress
        })}>
          <Text style={tw`text-slate-100`}>Depo 1</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-slate-700 flex items-center justify-center w-1/3 h-10 rounded mr-2 ${deliveredDisabled ? `bg-slate-500` : ``}`} disabled={deliveredDisabled} onPressOut={() => navigation.navigate("CameraPage", {
          tokenId: tokenId,
          subcollectionId: asset.subcollectionId,
          key: "delivered",
          nftAddress: nftAddress
        })}>
          <Text style={tw`text-slate-100`}>Teslim noktası</Text>
          {deliveredDisabled ? (<View style={tw`absolute w-8 bg-green-600 aspect-square rounded-full flex justify-center items-center`}>
            <Text style={tw`font-700 text-slate-50`}>✓</Text>
          </View>) : ("")}
        </TouchableOpacity>
      </View>
      <View style={tw`w-full h-0.5 bg-slate-900 mt-5`}></View>
      <Text style={tw`text-lg`}>Detaylar</Text>
      <View>
        <Text style={tw`mb-2`}><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).stamp}</Text> / {calculateProductRecordInfoEachLocation(asset).total} bağış kolisi üretildi</Text>
        <Text style={tw`mb-2`}><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).shipped} </Text>/ {calculateProductRecordInfoEachLocation(asset).total} teslim alındı.</Text>
        <Text><Text style={tw`font-700`}>{calculateProductRecordInfoEachLocation(asset).delivered}</Text> / {calculateProductRecordInfoEachLocation(asset).total} ihtiyaç sahibine ulaştırıldı.</Text>
      </View>
    </ScrollView >
  );
}
