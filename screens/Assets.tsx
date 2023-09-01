import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AssetBox from '../components/AssetBox';

export default function Assets({ route, navigation }) {

  const { collectionItemId } = route.params

  const [assets, setAssets] = useState([]);

  useEffect(() => {

    const url = `http://192.168.1.14:4000/get-all-items-collection?subcollectionId=${collectionItemId}`;

    axios.get(url)
      .then((res) => {
        const data = res.data;
        console.log(data.activeItems[1])
        setAssets(data.activeItems);
      })
      .catch((err) => {
        console.error(err);
      })


  }, []);

  return (
    <ScrollView style={tw`w-full h-full p-8`}>
      <Text style={tw`text-2xl`}>Pick a product to record</Text>
      <View style={tw`w-full h-0.5 bg-slate-900 mb-5`}></View>
      {assets.map(asset => {
        return (
          <AssetBox
            key={asset["tokenId"]}
            navigation={navigation}
            tokenUri={asset["tokenUri"] || "https://wallpaperaccess.com/full/187161.jpg"}
            tokenId={asset["tokenId"]}
          />
        )
      })}
    </ScrollView >
  );
}
