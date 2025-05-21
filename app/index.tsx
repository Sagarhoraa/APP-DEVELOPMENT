import {StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.conatiner}>
      <Text style={styles.title}>HELLO </Text>
      

      <Link  href="/(auth)/signup" >Signup </Link>
      <Link  href="/(auth)" >Login </Link>
    </View>
  );
}

const styles= StyleSheet.create({
  conatiner:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
  },
  title: {color: "blue" }, 

});
