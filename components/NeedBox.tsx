

import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';

import axios from 'axios';
import React from 'react';


export default function NeedBox({ navigation, tokenUri, tokenId, subcollectionId, history, availableEditions }) {

  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetImage, setAssetImage] = useState("");

  const [totalNeeds, setTotalNeeds] = useState(0);
  const [satisfiedNeeds, setSatsfiedNeeds] = useState(0);

  useEffect(() => {

    let historyCount = 0;

    for (let i = 0; i < history.length; i++) {
      const historyElement = history[i];
      
      if (historyElement.key == "buy") {
        historyCount++;
      };
    };

    setTotalNeeds(historyCount + availableEditions);
    setSatsfiedNeeds(historyCount);
  }, []);

  useEffect(() => {

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

  }, [])

  return (
    <View style={tw`mb-12 border w-full p-4 rounded-xl bg-slate-100`}>
      <View style={tw`h-60 aspect-square mb-4 border rounded-xl overflow-hidden`}>
        <Image
          style={tw`h-full w-full rounded-xl`}
          source={{
            uri: `${assetImage}` || "https://wallpaperaccess.com/full/187161.jpg",
          }}
        />
      </View>
      <Text># {tokenId}</Text>
      <Text style={tw`text-xl`}>{assetName}</Text>
      <Text style={tw`text-xs mb-8`}>{assetDescription}</Text>
      <View style={tw`w-full flex flex-row`}>
        <Text>Karşılanma</Text>
        <View style={tw`w-7/12 relative my-1 mx-4`}>
          <View style={tw`w-full bg-slate-300 h-2 absolute rounded-full`}></View>
          <View style={{
            width: `${(satisfiedNeeds/totalNeeds) * 100}%`,
            height: 8,
            backgroundColor: "green",
            position: "absolute",
            zIndex: "100",
            borderRadius: "10px"
          }}></View>
        </View>
        <Text>{satisfiedNeeds}/{totalNeeds}</Text>
      </View>
      <Button
        title='Doğrula'
        onPress={() => { navigation.navigate("Asset", { tokenId: tokenId, subcollectionId: subcollectionId }) }}
      />
    </View >
  );
}
