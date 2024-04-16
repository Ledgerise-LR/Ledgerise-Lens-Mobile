import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import axios from "axios";
import NeedBox from '../components/NeedBox';
import React from 'react';
import { URL, PORT } from '../serverConfig';

export default function Collections({ navigation }) {

  const [needName, setNeedName] = useState("");
  const [needDescription, setNeedDescription] = useState("");
  const [needQuantity, setNeedQuantity] = useState("");


  const handleCreateNeedClick = () => {
    if (needName && needDescription && needQuantity) {
      
      axios.post(`${URL}:${PORT}/need/create`, {
        beneficiaryPhoneNumber: beneficiary.phone_number,
        name: needName,
        description: needDescription,
        quantity: needQuantity,
        beneficiary_id: beneficiary._id
      })
        .then((res) => {
          const data = res.data;
          if (data.success && !data.err) {
            updateUI();
          } else {
            alert("An error occured in the creation of need. Please try again later.");
          }
        })
    }
  }


  const [beneficiary, setBeneficiary] = useState("");

  const [needs, setNeeds] = useState([]);

  const updateUI = () => {
    axios.get(`${URL}:${PORT}/auth/authenticate-beneficiary`)
    .then((res) => {
      // console.log(res.data)
      if (res.data.success && res.data.beneficiary) {
        
        setBeneficiary(res.data.beneficiary);
        const url = `${URL}:${PORT}/beneficiary/get-needs`;

        axios.post(url, {
          beneficiary_id: res.data.beneficiary._id
        })
          .then(res => {

            const beneficiaryNeedsData = res.data.needs;
            setNeeds(beneficiaryNeedsData);
          });
      }
      else if (!res.data.success && res.data.err) return navigation.navigate("Welcome");
    }) 
    .catch((err) => {
      console.log(err)
    })
  }

  useEffect(() => {
    if (URL) {
      updateUI();
    }
  }, [URL, PORT]);


  return (
    <ScrollView style={tw`w-full h-full p-8`}>
      <Text style={tw`text-2xl`}>Mevcut başvurularım</Text>
      <View style={tw`w-full h-0.5 bg-slate-900 mb-4`}></View>
      {needs.map(need => {
        return (
          <View key={need._id} style={tw`w-full border mb-4 h-50 p-4`}>
            <Text style={tw`mb-2`}>{need.name}</Text>
            <Text>{need.description}</Text>
            <View style={tw`mt-4 flex flex-1 w-full justify-between flex-row`}>
              <View>
                <Text>Tarih</Text>
                <Text>{(need.timestamp)}</Text>
              </View>
              <View>
                <Text>Miktar</Text>
                <Text>{need.quantity}</Text>
              </View>
            </View>
            <View style={tw`w-full h-12`}>
              <TouchableOpacity style={tw`w-full h-full p-4 bg-blue-500 rounded`} onPressOut={() => {
                navigation.navigate(
                  "CameraPage",
                  {
                    isNeedItem: true,
                    subcollectionId: need.subcollectionId,
                    key: "delivered",
                    nftAddress: need.nftAddress
                  }
                )
              }}>
                <Text style={tw`text-slate-50 font-bold`}>Ürünün size ulaştığını doğrulayın</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })}
      <View style={tw`w-full h-0.5 bg-slate-900 mb-5 mt-4`}></View>
          <View>
            <Text>
              İhtiyaç başvurusunda bulunun
            </Text>
          </View>
          <TextInput
            style={tw`px-2 py-4 bg-slate-100 rounded-lg mb-4`}
            placeholder='Hangi ürün için başvuruda bulunuyorsunuz?'
            onChangeText={(text) => {
              setNeedName(text);
            }}
          />
          <TextInput
            style={tw`px-2 py-4 bg-slate-100 rounded-lg mb-4`}
            placeholder='Ürün hakkındaki başvurunuzu detaylandırınız'
            onChangeText={(text) => setNeedDescription(text)}
            secureTextEntry={false}
          />
          <TextInput
            style={tw`px-2 py-4 bg-slate-100 rounded-lg`}
            placeholder='Kaç adet ihtiyacınız olduğunu belirtin'
            textContentType="creditCardNumber"
            onChangeText={(text) => setNeedQuantity(text)}
            secureTextEntry={false}
          />
          <TouchableOpacity style={tw`w-3/5 h-14 bg-blue-900 relative rounded-lg ml-auto mt-4 mb-96`} onPressOut={() => { handleCreateNeedClick() }}>
            <View style={tw`flex flex-row h-full w-full bg-blue-900 relative items-center rounded-lg`}>
              <Text style={tw`ml-4 text-slate-50 font-bold`}>Başvuruda bulun</Text>
            </View>
        </TouchableOpacity>
    </ScrollView >
  );
}
