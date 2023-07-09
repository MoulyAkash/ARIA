import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Modal,
  Pressable,
  Image,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import UnityView from '@azesmway/react-native-unity';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';

import SampleImage from '../assets/sample.jpg';
import APIService from '../api/Service';
import AIButton from '../components/AIButton';
import {capitalize, generateBoxShadowStyle, formatQuery} from '../utils';
import {colors} from '../colors';
import {fonts} from '../fonts';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

export default function Home({navigation}) {
  const unityRef = useRef(null);
  const [query, setQuery] = useState('');
  const [detectedObject, setDetectedObject] = useState({
    name: '',
    confidence: '',
  });
  const [detectedObjectInfo, setDetectedObjectInfo] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [modalVisible, setModalVisible] = useState(false);

  const sendRequest = (query) => {
    APIService.PostData(
      {query: `Define what is a ${query} within 100 words`},
      'searchBing',
    ).then(async (response) => {
      await fetch(
        `https://api.unsplash.com/search/photos?client_id=lWLD8kjZM-K50n9KH6Fr0jReOjmR2qU-PMa0GMlPxwk&query=${query}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            // Accept: 'application/json',
          },
        },
      ).then(async (imageResponse) => {
        const responseJson = await imageResponse.json();
        // console.log(responseJson);
        setDetectedObjectInfo({
          name: query,
          description: response.response.text
            .replace(/Bing/g, 'Aria')
            .replace(/Microsoft/g, 'T6')
            .replace(/\[\^(.*?)\^\]/g, ''),
          image: responseJson.results[0].urls.regular,
        });
        setModalVisible(true);
      });
    });
  };

  const onUnityMessage = (result) => {
    const message = result.nativeEvent.message.split(':');
    if (detectedObject.name === message[0]) return;
    console.log('onUnityMessage', result.nativeEvent.message);
    setDetectedObject({
      name: message[0],
      confidence: message[1].slice(0, -1),
    });
    setDetectedObjectInfo({
      name: '',
      description: '',
      image: '',
    });
    sendRequest(message[0]);
  };

  const onPress = () => {
    console.log('Press detected!');
    if (unityRef?.current) {
      const message = {
        gameObject: 'Camera Image',
        methodName: 'OnRefresh',
        message: '',
      };
      unityRef.current.postMessage(
        message.gameObject,
        message.methodName,
        message.message,
      );
    }
  };

  const onLongPress = () => {
    // console.log('Long Press detected!');
    Voice.start();
  };

  const onLongPressRelease = async (type) => {
    // console.log('Long Press Released');
    Voice.stop();
    if (type === 'heldUp') {
      navigation.navigate('AIChat', {type: type});
    }
  };

  const onSwipeUp = () => {
    // console.log('Swiped Up');
    navigation.navigate('AIChat', {type: 'swipedUp'});
  };

  const onSwipeDown = () => {
    // console.log('Swiped Down');
    navigation.navigate('Landmark');
  };

  const onHoldUp = () => {
    // console.log('Hold Up Detected');
    // navigation.navigate('AIChat', {type: 'heldUp'});
  };

  const onSpeechPartialResults = (e) => {
    setQuery(e.value[0]);
  };

  const onSpeechResults = async (e) => {
    await AsyncStorage.setItem('query', e.value[0]).then(() =>
      setQuery(e.value[0]),
    );
  };

  useEffect(() => {
    // Voice.onSpeechRecognized = onSpeechRecognized;
    // Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechResults = onSpeechResults;
  }, []);

  return (
    <View style={styles.container}>
      <UnityView
        ref={unityRef}
        style={styles.unityView}
        onUnityMessage={onUnityMessage}
        androidKeepPlayerMounted
      />
      {modalVisible && (
        <View style={styles.modalContainer}>
          <Image
            source={{uri: detectedObjectInfo.image} || SampleImage}
            style={styles.modalImage}
          />
          <Pressable
            style={styles.modalHeadingWrapper}
            onPress={() => console.log(detectedObjectInfo)}>
            <Text style={styles.modalHeading}>
              {detectedObject.name || 'Laptop'}
            </Text>
            <View style={styles.modalConfidenceWrapper}>
              <Text style={styles.modalConfidenceText}>
                {detectedObject.confidence || '99'}%
              </Text>
            </View>
          </Pressable>
          <View style={styles.modalDescriptionWrapper}>
            <ScrollView>
              <Text style={styles.modalDescriptionText}>
                {detectedObjectInfo.description || 'Sample Description'}
              </Text>
            </ScrollView>
          </View>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}>
            <AntDesign name="close" size={18} color={colors.white} />
          </Pressable>
        </View>
      )}
      <Pressable
        style={{
          position: 'absolute',
          top: 0,
          right: windowWidth / 7.25,
          height: '100%',
          width: '100%',
        }}
        onPress={async () => {
          if (detectedObject.name === '') return;
          else if (detectedObjectInfo.description === '') {
            ToastAndroid.show(
              'Please wait for the description to load',
              ToastAndroid.SHORT,
            );
            return;
          }
          setModalVisible(true);
        }}></Pressable>
      <View style={styles.bottomContainer}>
        {query && (
          <View style={styles.queryTextContainer}>
            <Text style={styles.queryText}>{capitalize(query)}</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <AIButton
            size={100}
            onPress={onPress}
            onLongPress={onLongPress}
            onLongPressRelease={onLongPressRelease}
            onSwipeUp={onSwipeUp}
            onSwipeDown={onSwipeDown}
            onHoldUp={onHoldUp}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unityView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 1,
    bottom: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    right: windowWidth / 7.25,
    height: 300,
    width: 300,
    marginBottom: 25,
    paddingBottom: 25,
    justifyContent: 'flex-end',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  queryTextContainer: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  queryText: {
    color: colors.black,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  modalContainer: {
    position: 'relative',
    zIndex: 6,
    width: 350,
    height: '80%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    ...generateBoxShadowStyle(0, 8, 24, 1, colors.grey, 16),
  },
  modalImage: {
    width: '100%',
    height: '35%',
    borderRadius: 20,
    objectFit: 'cover',
    ...generateBoxShadowStyle(0, 8, 24, 1, colors.grey, 16),
  },
  modalHeadingWrapper: {
    width: '100%',
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeading: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.darkGrey,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  modalConfidenceWrapper: {
    backgroundColor: colors.purple,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalConfidenceText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  modalDescriptionWrapper: {
    width: '100%',
    height: '45%',
    marginTop: 20,
  },
  modalDescriptionText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.darkGrey,
  },
  modalCloseButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.red,
    borderRadius: 50,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
