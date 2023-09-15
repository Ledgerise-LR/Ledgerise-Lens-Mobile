import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from "axios";
import CollectionBox from '../components/CollectionBox';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SERVER_URL } from '@env';


export default function Collections({ navigation }) {

  const [collections, setCollections] = useState([]);

  useEffect(() => {

    const url = `http://192.168.1.14:4000/get-all-collections`;

    axios.get(url)
      .then(res => {
        const data = res.data.subcollections;
        setCollections(data);
      })
      .catch(error => {
        console.error(error);
      })

  }, []);

  return (
    <ScrollView style={tw`w-full h-full p-8`}>
      <Text style={tw`text-2xl`}>Collections</Text>
      <View style={tw`w-full h-0.5 bg-slate-900 mb-5`}></View>
      {collections.map(collection => {
        return (
          <CollectionBox
            key={collection["itemId"]}
            navigation={navigation}
            itemId={collection["itemId"]}
            collectionName={collection["name"]}
            collectionPhoto={collection["image"] || "https://wallpaperaccess.com/full/187161.jpg"}
          />
        )
      })}
    </ScrollView >
  );
}
