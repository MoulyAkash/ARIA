import React, {useState, useEffect, useRef} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import APIService from '../api/Service';
import {capitalize, formatQuery, getCurrentTime} from '../utils';
import ChatBubble from '../components/ChatBubble';
import {colors} from '../colors';

export default function AIChat({navigation, route}) {
  const progress = useRef(new Animated.Value(0)).current;
  const chatContainerRef = useRef(null);
  const [query, setQuery] = useState('');

  const [chat, setChat] = useState([
    {
      type: 'ai',
      value: [
        {
          type: 'string',
          value: 'Hello, I am ARIA! How can I help you today?',
        },
      ],
      timeStamp: getCurrentTime(),
    },
  ]);

  const sendMessage = async (query) => {
    if (!query.trim() || !/\w/.test(query)) return;
    let newChat = [
      ...chat,
      {
        type: 'user',
        value: [{type: 'string', value: query}],
        timeStamp: getCurrentTime(),
      },
    ];
    setChat(newChat);
    await AsyncStorage.setItem('chat', JSON.stringify({chat: newChat}));
    setQuery('');
    sendRequest(newChat, query);
  };

  const sendRequest = (oldChat, query) => {
    APIService.PostData({query: query}, 'searchBing').then(async (response) => {
      let newChat = [
        ...oldChat,
        {
          type: 'ai',
          value: formatQuery(
            response.response.text
              .replace(/Bing/g, 'Aria')
              .replace(/Microsoft/g, 'T6'),
          ),
          timeStamp: getCurrentTime(),
        },
      ];
      setChat(newChat);
      await AsyncStorage.setItem('chat', JSON.stringify({chat: newChat}));
    });
  };

  const onLongPress = () => {
    if (query.length > 0) return;
    Voice.start();
  };

  const onPressOut = () => {
    Voice.stop();
  };

  const onSpeechPartialResults = (e) => {
    setQuery(capitalize(e.value[0]));
  };

  const onSpeechResults = async (e) => {
    setQuery(capitalize(e.value[0]));
  };

  useEffect(() => {
    Animated.spring(progress, {
      toValue: query.length === 0 ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [query]);

  useEffect(() => {
    const getChat = async () => {
      AsyncStorage.getItem('chat')
        .then((value) => {
          value ? setChat(JSON.parse(value).chat) : null;
        })
        .catch((error) => console.log(error));
      if (route.params && route.params.type === 'heldUp') {
        AsyncStorage.getItem('query')
          .then((query) => sendMessage(capitalize(query)))
          .catch((error) => console.log(error));
      }
    };
    getChat();
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechResults = onSpeechResults;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <ScrollView
        contentContainerStyle={styles.chatContainer}
        ref={chatContainerRef}
        onContentSizeChange={() => {
          chatContainerRef.current?.scrollToEnd();
        }}>
        {chat.map((item, index) => (
          <ChatBubble
            key={index}
            type={item.type}
            value={item.value}
            timeStamp={item.timeStamp}
          />
        ))}
      </ScrollView>
      <View style={styles.bottomBar}>
        <View style={styles.textInputContainer}>
          <MaterialIcons
            name="emoji-emotions"
            size={30}
            color={colors.darkGrey}
          />
          <TextInput
            style={styles.textInput}
            onChangeText={setQuery}
            value={query}
            placeholder="Message"
            multiline
          />
        </View>
        <Pressable
          onPress={() => sendMessage(query)}
          onLongPress={onLongPress}
          onPressOut={onPressOut}
          style={styles.sendButtonContainer}>
          <Animated.View
            style={[
              styles.sendButton,
              {
                transform: [
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                  },
                ],
              },
            ]}>
            <FontAwesome size={20} color={colors.grey} name="send" />
          </Animated.View>
          <Animated.View
            style={[
              styles.sendButton,
              {
                transform: [
                  {
                    scale: progress,
                  },
                ],
              },
            ]}>
            <FontAwesome size={20} color={colors.grey} name="microphone" />
          </Animated.View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },
  chatContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.grey,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
  },
  sendButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 50,
    position: 'relative',
  },
  sendButton: {
    position: 'absolute',
  },
});
