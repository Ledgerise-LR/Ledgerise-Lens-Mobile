

import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';

export default function CollectionBox({ navigation, collectionName, itemId, collectionPhoto }) {

  return (
    <View style={tw`mb-12 border w-full p-4 rounded-xl`}>
      <View style={tw`h-2/3 aspect-square mb-4 border rounded-xl overflow-hidden`}>
        <Image
          style={tw`h-full w-full rounded-xl`}
          source={{
            uri: `${collectionPhoto}`,
          }}
        />
      </View>
      <Text style={tw`font-bold`}>{collectionName}</Text>
      <Text># {itemId}</Text>
      <Button
        title='View'
        onPress={() => navigation.navigate("Assets", { collectionItemId: itemId })}
      />
    </View >
  );
}
