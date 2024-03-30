import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import axios from "axios";
import NeedBox from '../components/NeedBox';
import React from 'react';
import { URL, PORT } from '../serverConfig';

export default function Collections({ navigation }) {

  const [needName, setNeedName] = useState("");
  const [needDescription, setNeedDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  const [needs, setNeeds] = useState([]);

  useEffect(() => {
    if (URL) {
     axios.get(`${URL}:${PORT}/auth/authenticate-beneficiary`)
        .then((res) => {
          if (res.data.success && res.data.beneficiary) {
            
            setBeneficiary(res.data.beneficiary);
            const url = `${URL}:${PORT}/beneficiary/get-needs-temp`;

            console.log(res.data.beneficiary.needs)
            axios.post(url, {
              needs: res.data.beneficiary.needs
            })
              .then(res => {

                const beneficiaryNeedsData = res.data.activeItems;
                setNeeds(beneficiaryNeedsData);
              });
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
      <Text style={tw`text-2xl`}>Mevcut başvurularım</Text>
      <View style={tw`w-full h-0.5 bg-slate-900 mb-5`}></View>
      {needs.map(need => {
        return (
          <NeedBox
            key={need["tokenId"]}
            navigation={navigation}
            tokenId={need["tokenId"]}
            subcollectionId={need["subcollectionId"]}
            tokenUri={need["tokenUri"]}
            history={need["history"]}
            availableEditions={need["availableEditions"]}
          />
        )
      })}
      <View style={tw`w-full h-0.5 bg-slate-900 mb-5`}></View>
          <View>
            <Text>
              İhtiyaç başvurusunda bulunun
            </Text>
          </View>
          <TextInput
            style={tw`px-2 py-4 bg-slate-100 rounded-lg mb-4`}
            placeholder='Hangi ürün için başvurmak istiyorsunuz?'
            onChangeText={(text) => {
              setNeedName(text);
            }}
          />
          <TextInput
            style={tw`px-2 py-4 bg-slate-100 rounded-lg`}
            placeholder='Ürün hakkındaki başvurunuzu detaylandırınız'
            onChangeText={(text) => setNeedDescription(text)}
            secureTextEntry={true}
          />      
    </ScrollView >
  );
}
