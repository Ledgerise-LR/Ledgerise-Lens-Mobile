import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import axios from "axios";
import CollectionBox from '../components/CollectionBox';
import React from 'react';
import { URL, PORT } from '../serverConfig';

export default function Collections({ navigation }) {

  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (URL) {
      axios.get(`${URL}:${PORT}/auth/authenticate-verifier`)
        .then((res) => {
          if (res.data.success && res.data.company) {
            const url = `${URL}:${PORT}/get-all-collections`;

            axios.get(url)
              .then(res => {
                const data = res.data.subcollections;
                setCollections(data);
              })
              .catch(error => {
                console.error(error);
              })
            return { success: true, company: res.data.company }
          };
          if (!res.data.success && res.data.err) return navigation.navigate("Welcome")
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [URL, PORT]);


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
