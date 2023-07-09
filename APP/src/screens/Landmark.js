import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

import SampleImage from '../assets/sample.jpg';
import APIService from '../api/Service';
import {capitalize, generateBoxShadowStyle, formatQuery} from '../utils';
import {colors} from '../colors';
import {fonts} from '../fonts';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Waiting</Text>
  </View>
);

export default function Landmark() {
  const takePicture = async function (camera) {
    console.log('takePicture');
    const options = {quality: 0.5, base64: true};
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    // console.log(data.base64);
    fetch('http://192.168.62.111:5000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        photo: data.base64,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        sendRequest(
          data.location,
          (parseFloat(data.confidence) * 100).toFixed(0).toString(),
        );
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const [detectedObjectInfo, setDetectedObjectInfo] = useState({
    name: '',
    description: '',
    image: '',
    confidence: '',
  });
  const [modalVisible, setModalVisible] = useState(false);

  const sendRequest = (query, confidence) => {
    APIService.PostData(
      {query: `Give me some information about ${query} within 100 words`},
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
          confidence: confidence,
        });
        setModalVisible(true);
      });
    });
  };

  return (
    <View style={styles.container}>
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
              {detectedObjectInfo.name || 'Laptop'}
            </Text>
            <View style={styles.modalConfidenceWrapper}>
              <Text style={styles.modalConfidenceText}>
                {detectedObjectInfo.confidence || '99'}%
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
          //   backgroundColor: colors.red,
          zIndex: 1,
        }}
        onPress={async () => {
          if (detectedObjectInfo.name === '') return;
          else if (detectedObjectInfo.description === '') {
            ToastAndroid.show(
              'Please wait for the description to load',
              ToastAndroid.SHORT,
            );
            return;
          }
          setModalVisible(true);
        }}></Pressable>
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        {({camera, status, recordAudioPermissionStatus}) => {
          if (status !== 'READY') return <PendingView />;
          return (
            <Pressable
              style={styles.button}
              onPress={() => takePicture(camera)}>
              <FontAwesome name="camera" size={40} color={colors.red} />
            </Pressable>
          );
        }}
      </RNCamera>
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
  preview: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    zIndex: 2,
    backgroundColor: colors.subtlePink,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 22,
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
