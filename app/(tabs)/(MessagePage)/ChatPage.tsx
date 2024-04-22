import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Dimensions, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getUser, IUser } from '@/components/FirebaseUserFunctions';
import { useAuth } from "@/Context/AuthContext";
import { useIsFocused } from '@react-navigation/native'; // Import useIsFocused hook
import { router } from "expo-router";
import { GiftedChat, Composer, Send } from 'react-native-gifted-chat';
import Fire from './data'
import { globalState } from './globalState';
import { generateChatId } from './data';
import { FontAwesome } from '@expo/vector-icons';
import { getUserPicture } from '@/components/FirebaseUserFunctions';
import { Avatar, NativeBaseProvider } from 'native-base';

type Props = {
  navigation: StackNavigationProp<any>;
};


const ChatPage: React.FC<Props> = ({ navigation }) => {

  const { User, currUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const isFocused = useIsFocused(); // Use the useIsFocused hook to track screen focus
  const [loading, setLoading] = useState<boolean>(true); // State to track loading status
  const [friendIcon, setFriendIcon] = useState<string>();
  const [userIcon, setUserIcon] = useState<string>();


  // Accessing the user parameter passed to this screen
  const receiveUser = globalState.user; // Using optional chaining in case params are undefined

  if (!User) {
    return null;
  }

  // function renderMessage(props) {
  //   return (
  //     <View style={{
  //       maxWidth: '70%',
  //       margin: 5,
  //       padding: 10,
  //       borderRadius: 5,
  //       backgroundColor: props.currentMessage.user._id === receiveUser.uid ? '#FED7AA' : '#F97316',
  //       alignSelf: props.currentMessage.user._id === receiveUser.uid ? 'flex-start' : 'flex-end',
  //     }}>
  //       <Text style={{ color: props.currentMessage.user._id === receiveUser.uid ? '#171717' : '#FFF7ED', fontSize: 18 }}>
  //         {props.currentMessage.text}
  //       </Text>
  //     </View>
  //   );
  // }

  async function fetchIconByUser(inputUser) {
    if (currUser && inputUser.icon) {
      try {
        const icon = await getUserPicture(inputUser.icon, "Avatar");
        return icon
      } catch (error) {
        console.error("Failed to fetch friend icon:", error);
      }
    }
    // Fallback to default icon if user icon is not available or there is an error
    return getUserPicture("Icon/Default/Avatar.png", "Avatar");
  }

  useEffect(() => {
    fetchIconByUser(currUser).then(url => {
      setUserIcon(url);

    });
    fetchIconByUser(receiveUser).then(url => {
      setFriendIcon(url);

    })

    console.log("User icon url:", userIcon);
    console.log(friendIcon);
  }, [currUser, receiveUser, userIcon, friendIcon])

  function renderMessage(props) {
    return (
      <NativeBaseProvider>
        <View style={{
          flexDirection: props.currentMessage.user._id === receiveUser.uid ? 'row' : 'row-reverse',
          alignItems: 'center',
          marginHorizontal: 10,
          alignSelf: props.currentMessage.user._id === receiveUser.uid ? 'flex-start' : 'flex-end',
        }}>
          {/* Avatar */}
          <Avatar m={1} size="45" source={{ uri: props.currentMessage.user._id === receiveUser.uid ? friendIcon : userIcon }} />
          {/* Message bubble */}
          <View style={{
            maxWidth: '70%',
            margin: 10,
            padding: 10,
            borderRadius: 5,
            backgroundColor: props.currentMessage.user._id === receiveUser.uid ? '#FED7AA' : '#F97316',
            alignSelf: props.currentMessage.user._id === receiveUser.uid ? 'flex-start' : 'flex-end',
          }}>
            <Text style={{
              color: props.currentMessage.user._id === receiveUser.uid ? '#171717' : '#FFF7ED',
              fontSize: 18
            }}>
              {props.currentMessage.text}
            </Text>
          </View>
        </View>
      </NativeBaseProvider>
    );
  }

  // Set style of the text input box
  function renderComposer(props) {
    return (
      <Composer
        {...props}
        textInputStyle={styles.composer}
      />
    );
  }

  // Set style of the send button
  function renderSend(props) {
    return (
      <Send
        {...props}
        containerStyle={styles.sendContainer}
      >
        <View style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </View>
      </Send>
    );
  }

  // Logic to send a message
  const sendMessage = (messages = []) => {
    Fire.shared.send(messages, User.uid, receiveUser); // Use user.uid to send messages
    setMessage('');
  };


  useEffect(() => {

    const chatId = generateChatId(User.uid, receiveUser.uid);
    Fire.shared.on(chatId, message =>
      setMessages(previousMessages => GiftedChat.append(previousMessages, message))
    );

    return () => {
      Fire.shared.off();
    };
  }, []);

  const styles = StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 10,
      paddingTop: 70,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    userName: {
      fontWeight: 'bold',
      fontSize: 24,
      textAlign: 'center',
    },
    chatContainer: {
      flex: 1,
      padding: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      backgroundColor: '#fff',
    },
    input: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 10,
      borderColor: 'gray',
      backgroundColor: '#ffffff',
    },
    messageBubble: {
      padding: 10,
      borderRadius: 20,
      marginVertical: 5,
    },
    incomingMessage: {
      backgroundColor: '#e5e5ea',
      alignSelf: 'flex-start',
    },
    outgoingMessage: {
      backgroundColor: '#0b93f6',
      alignSelf: 'flex-end',
      color: '#fff',
    },
    profilePicture: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#dedede',
    },
    userInfo: {
      marginLeft: 10,
    },
    composer: {
      backgroundColor: '#F5F5F5',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E4E9F2',
      paddingTop: 8.5,
      paddingHorizontal: 12,
      marginLeft: 0, // Adjust as necessary
      marginRight: 10, // Adjust as necessary
    },
    sendContainer: {
      justifyContent: 'center',
      height: 44,
      marginRight: 10, // Adjust as necessary
    },
    sendButton: {
      marginRight: 10,
      marginBottom: 5,
      borderWidth: 1, // Add a border
      borderColor: '#000000', // Border color matching the text color
      borderRadius: 15, // Rounded corners for the bubble effect
      paddingVertical: 5, // Vertical padding inside the bubble
      paddingHorizontal: 10, // Horizontal padding inside the bubble
      backgroundColor: 'white', // Background color for the bubble
    },
    sendText: {
      color: '#000000', // Customize the color
      fontWeight: 'bold',
      fontSize: 16
    },
    backButton: {
      position: 'absolute',  // Positions the button absolutely to stick to the left
      left: 10,
      paddingTop: 60,
    }
  });

  const handleGoBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? -1000 : 20}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => handleGoBack()}>
          <FontAwesome name="chevron-left" size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.userName}>{receiveUser.name}</Text>
        <TouchableOpacity>
          {/* Icon for additional options */}
        </TouchableOpacity>
      </View>
      <GiftedChat
        messages={messages}
        onSend={messages => sendMessage(messages)}
        renderMessage={renderMessage}
        user={{
          _id: User.uid, // Use the UID from useAuth
          name: User.displayName || 'Anonymous', // Use the displayName from useAuth, if available
        }}
        alwaysShowSend={true}
        renderComposer={renderComposer}
        renderSend={renderSend}
        text={message}
        onInputTextChanged={text => setMessage(text)}
        textInputProps={{
          returnKeyType: "send", // Label the return key as 'send'
          onSubmitEditing: (e) => {
            // When the user presses 'enter', check if the input is not just whitespace
            if (e.nativeEvent.text.trim()) {
              sendMessage([{ text: e.nativeEvent.text.trim() }]);
            }
          },
          blurOnSubmit: false, // Prevents the keyboard from dismissing on submit
          multiline: false,
        }}
      />
    </KeyboardAvoidingView>
  );
}



export default ChatPage;