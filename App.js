import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View } from 'react-native';
import tw from 'tailwind-react-native-classnames'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={[tw`block mb-2 text-sm font-medium text-gray-900`]}>Dashboard URL</Text>
      <TextInput
        style={[tw`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-60 p-2.5 mb-2`]}
        placeholder="http://example.com:81"
      />
      <Text style={[tw`block mb-2 text-sm font-medium text-gray-900`]}>Email</Text>
      <TextInput
        style={[tw`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-60 p-2.5 mb-2`]}
        placeholder="email@example.com"
      />
      <Text style={[tw`block mb-2 text-sm font-medium text-gray-900`]}>Password</Text>
      <TextInput
        style={[tw`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-60 p-2.5 mb-2`]}
        placeholder="http://example.com:81"
      />
      <TouchableOpacity onPress={() => alert('Hello, world!')} style={[tw`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2`]}>
        <Text style={[tw`text-white`]}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});