import { useState } from "react";
import { View, Text } from "react-native";
import {
  Alert,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TextInput,
} from "react-native";
import { firestore } from "../../firebaseConfig";
import { router } from "expo-router";
import { UserCredential } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { useAuth } from "../../Context/AuthContext";
import { addUser } from "@/components/FirebaseUserFunctions"
import {
  Box,
  Button,
  NativeBaseProvider,
  Pressable,
  ScrollView,
  Spacer,
  Tag,
  extendTheme,
  Flex,
  Input
} from "native-base";

export default function SignUpScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string | undefined>();
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>();
  const [passwordMatchError, setPasswordMatchError] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  const { CreateUser } = useAuth();
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text !== confirmPassword) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (password !== text) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleSignUp = async () => {
    if (name && email && password && confirmPassword && password === confirmPassword) {
      console.log('name is ' + name);
      try {
        router.navigate({
          pathname: "SignUp2",
          params: {
            name: name,
            password: password,
            email: email,

          }
        });
        
        // const userCredential = await CreateUser(email, password);
        // const user = userCredential.user;

      } catch (error: any) {
        Alert.alert("Error", error.message);
      }
      
    } else {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
      }
      Alert.alert("Error", "Please fill in all fields");
    }
  };

  const theme = extendTheme({
    components: {
      Button: {
        baseStyle: {
          color: "#F97316",
          rounded: "full",
        },
      },
    },
  });

  return (
    <NativeBaseProvider theme={theme}>
      <SafeAreaView style= {{backgroundColor:"#FFF"}}>
        <ScrollView backgroundColor={"#FFFFFF"}>
          <Box ml={"3"} mr={"3"} paddingTop={"10"}>
  
            <Text style={styles.titleText}>Register</Text>
  
          <Box alignItems="left">
              Your Name
            <Input mx="3" placeholder="Name" w="90%" onChangeText={setName} />

              </Box>;
            <TextInput
              style={styles.loginTextField}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
            />
            
            {passwordMatchError && <Text>Passwords do not match</Text>}

            <Flex direction="column" justifyContent="space-around">

            <Button onPress={handleSignUp} > Next </Button>
            <Spacer/>
            <Button onPress={() => router.navigate("LogIn")} > Go Back </Button>
            </Flex>
            </Box>
        </ScrollView>
      </SafeAreaView>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    marginHorizontal: 50,
    backgroundColor: "white",
    paddingTop: 20,
  },
  titleContainer: {
    flex: 1.2,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 45,
    textAlign: "center",
    fontWeight: "200",
  },
  loginTextField: {
    borderBottomWidth: 1,
    height: 60,
    fontSize: 30,
    marginVertical: 10,
    fontWeight: "300",
    marginBottom: 20,
  },
  mainContent: {
    flex: 6,
  },
});
