import React, { useState, useEffect } from "react";
import { TextInput, Button } from "react-native-paper";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Geolocation from "react-native-geolocation-service";

import Web3 from "web3";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LocationComponent = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [index, setIndex] = useState(0);

  // const [location, setLocation] = useState(null);

  const contractAddress = "0x8942c02Dd77C4d3352b051798567778635A94333";
  const deviceContractAbi = require("./contractABI.json");

  const RPC_URL = "https://testnet-rpc.coinex.net/";

  const senderAddress = "0x3599cED19B48700eD5574D40a7b25DF7aeD9E2fB";
  const privateKey =
    "c0e2a44482ca956308c432349422152904c3ffcb620da0cf266e4faf47cd1cab";

  // const deviceContractAbi = require("./deviceContractABI.json");
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
  const contract = new web3.eth.Contract(deviceContractAbi, contractAddress);

  useEffect(() => {
    // const web3 = new Web3(new Web3.providers.HttpProvider(providerURL));
    var eventSubscription = null;
    async function subs() {
      const deviceContractAddress = await AsyncStorage.getItem(
        "device-contract-addr"
      );
      const deviceContract = new web3.eth.Contract(
        deviceContractAbi,
        deviceContractAddress
      );

      eventSubscription = deviceContract.on("getLocation", async (event) => {
        console.log("Event received:", event);
      });
      // .on("error", (error) => {
      //   console.error("Error with event subscription:", error);
      // });
    }

    subs();

    return () => {
      eventSubscription.unsubscribe();
    };
  }, []);

  const getLocation = async () => {
    setLoading(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        setLoading(false);
        setError("Location permission denied");
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const [count, setCount] = useState(0);
 
  useEffect(() => {
      //Implementing the setInterval method
      const interval = setInterval(() => {
          setCount(count + 1);
          updateLocation();
      }, 5000);

      //Clearing the interval
      return () => clearInterval(interval);
  }, [count]);

  async function updateLocation() {
    try {
        const deviceContractAddress = await AsyncStorage.getItem('device-contract-addr');
        const location = "this_is_my_location" + count;

        const gasPrice = await web3.eth.getGasPrice();
        const deviceContract = new web3.eth.Contract(
            deviceContractAbi,
            deviceContractAddress
        );

        const data = deviceContract.methods
            .updateLocation(location)
            .encodeABI();

        const tx = {
            from: senderAddress,
            to: deviceContractAddress,
            gasPrice: gasPrice,
            gas: web3.utils.toWei("3", "ether"), // Adjust gas limit as needed
            data: data,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
            tx,
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
        );

        console.log("Location updated, transaction hash:", receipt.transactionHash);
    } catch (error) {
        console.error("Error updating location:", error);
    }
}


  // setInterval(() => {
  //   var interval = updateLocation();

  //   return () => clearInterval(interval);
  // }, 5000);

      const tx = {
        from: senderAddress,
        to: deviceContractAddress,
        gasPrice: gasPrice,
        // gas: 300000, // Adjust gas limit as needed
        value: value,
        data: data,
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );

      // wait for it to return ()
      deviceContract.events.returnLocation().on("data", (e) => {
        // update location
        const { location } = e.returnValues;
        setLocation(location);
      });

      console.log("location updated, hash:", receipt.transactionHash);
    }

    setInterval(() => {
      updateLocation();
    }, 3000);

    async function fetchLocation() {
      try {
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(senderAddress);

        // Call getDeviceContract method
        const deviceContractAddress = await contract.methods
          .getDeviceContract(username)
          .call({
            from: senderAddress,
            to: contractAddress,
            gasPrice: gasPrice,
          });
        // const deviceContractAddress = deviceContractRes.contractAddress;
        console.log(deviceContractAddress);

        // Call tryFetchLocation method
        const deviceContract = new web3.eth.Contract(
          deviceContractAbi,
          deviceContractAddress
        );
        const locationData = deviceContract.methods
          .tryFetchLocation(username, password)
          .call({
            from: senderAddress,
            to: contractAddress,
            gasPrice: gasPrice,
          });

        setLocation(locationData);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    }

    const requestLocationPermission = async () => {
      try {
        const granted = await Geolocation.requestAuthorization("whenInUse");
        return granted === "granted";
      } catch (err) {
        console.error("Error requesting location permission:", err);
        return false;
      }
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
        <View style={styles.container}>
          <Text style={styles.title}>Get Location</Text>
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

          <Button mode="elevated" onPress={getLocation} disabled={loading} />

          <Button mode="elevated" onPress={fetchLocation} disabled={loading}>
            {loading ? "Getting Location..." : "Get Location"}
          </Button>
        </View>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
        {location && <Text>{location}</Text>}
      </View>
    );
  }
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
  input: {
    fontSize: 16,
    color: "#333",
    width: 350,
    margin: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  locationContainer: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginTop: 20,
  },
  menuButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default LocationComponent;
