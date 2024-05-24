import React, { useState } from "react";
import { TextInput, Button } from "react-native-paper";
import { View, Text, StyleSheet, Alert } from "react-native";
import Web3 from "web3";
import { useNavigation } from "@react-navigation/native";
// import contractAbi from "./contarctAbi.js";

// Your CoinEx Smart Chain HTTP endpoint
const RPC_URL = "https://rpc.coinex.net";

// Smart contract address and ABI
const contractAddress = "0xE0016f08dfE4B0D3a101BCE8fcc555Df3a6ED3a1";
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        components: [
          {
            internalType: "string",
            name: "deviceId",
            type: "string",
          },
          {
            internalType: "string",
            name: "cameraId",
            type: "string",
          },
          {
            internalType: "string",
            name: "batteryId",
            type: "string",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct DeviceData",
        name: "dd",
        type: "tuple",
      },
    ],
    name: "deRegisterDeviceContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "deviceId",
            type: "string",
          },
          {
            internalType: "string",
            name: "cameraId",
            type: "string",
          },
          {
            internalType: "string",
            name: "batteryId",
            type: "string",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct DeviceData",
        name: "dd",
        type: "tuple",
      },
    ],
    name: "registerDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        components: [
          {
            internalType: "string",
            name: "deviceId",
            type: "string",
          },
          {
            internalType: "string",
            name: "cameraId",
            type: "string",
          },
          {
            internalType: "string",
            name: "batteryId",
            type: "string",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct DeviceData",
        name: "dd",
        type: "tuple",
      },
    ],
    name: "registerDeviceContract",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "battery",
    outputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "camera",
    outputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "a",
        type: "string",
      },
      {
        internalType: "string",
        name: "b",
        type: "string",
      },
    ],
    name: "compareStrings",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "contracts",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "device",
    outputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "getDeviceContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Sender's address and private key
const senderAddress = "0x3599cED19B48700eD5574D40a7b25DF7aeD9E2fB";
const privateKey =
  "c0e2a44482ca956308c432349422152904c3ffcb620da0cf266e4faf47cd1cab";

// Initialize web3
const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
const contract = new web3.eth.Contract(contractABI, contractAddress);

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match");
      return;
    }

    try {
      // Define the device data
      const deviceData = {
        deviceId: "DEVICE_ID", // replace with actual device ID
        cameraId: "CAMERA_ID", // replace with actual camera ID
        batteryId: "BATTERY_ID", // replace with actual battery ID
        exists: true, // this should match your contract's logic
      };

      // Encode the parameters
      const data = contract.methods
        .registerDeviceContract(username, deviceData)
        .encodeABI();

      // Get the nonce
      const nonce = await web3.eth.getTransactionCount(senderAddress);

      // Create the transaction object
      const tx = {
        from: senderAddress,
        to: contractAddress,
        data: data,
        gas: 3000000, // Adjust gas limit
        // gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
        // nonce: nonce,
        chainId: 53, // Chain ID for CoinEx Smart Chain Mainnet
      };

      // Sign the transaction
      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

      // Send the signed transaction
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      console.log("Transaction successful with hash:", receipt.transactionHash);

      Alert.alert("Success", "Transaction sent successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Main"),
        },
      ]);
    } catch (error) {
      console.error("Error sending transaction:", error);
      Alert.alert("Error", "An error occurred");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          label="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <Button
          mode="elevated"
          onPress={handleSignup}
          style={{ marginTop: 20 }}
        >
          Register
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 40,
    margin: 10,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 10,
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    color: "#333",
    width: 350,
    margin: 10,
  },
});

export default SignupScreen;