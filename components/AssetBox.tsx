

import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';

import axios from 'axios';
import React from 'react';


export default function AssetBox({ navigation, tokenUri, tokenId }) {

  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetImage, setAssetImage] = useState("");


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
      <Text style={tw`text-xs`}>{assetDescription}</Text>
      <Button
        title='View'
        onPress={() => { navigation.navigate("Asset", { tokenId: tokenId }) }}
      />
    </View >
  );
}
