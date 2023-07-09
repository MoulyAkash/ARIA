// import { onPressHandlerIn } from 'deprecated-react-native-prop-types/DeprecatedTextPropTypes';
import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Pressable,
  Animated,
  Text,
  View,
  PanResponder,
  Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {scaleLinearYAnimation} from '../utils';
import AssistantIcon from '../assets/voice-assistant.png';
import {colors} from '../colors';

let holdTimeout = null;

const SWIPE_UP_TRIGGER_DISTANCE_MAX = 200;
const SWIPE_UP_TRIGGER_DISTANCE_MIN = 150;

export default function AIButton(props) {
  const progress = useRef(new Animated.Value(0.5)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const [_buttonHeldIn, _setButtonHeldIn] = useState(false);
  let buttonHeldIn = useRef(_buttonHeldIn).current;
  const setButtonHeldIn = (data) => {
    buttonHeldIn = data;
    _setButtonHeldIn(data);
  };

  const onPressHandler = () => {
    props.onPress();
  };

  const onLongPressHandler = () => {
    Animated.parallel([
      Animated.spring(progress, {toValue: 1, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1.2, useNativeDriver: true}),
    ]).start();
    setButtonHeldIn(true);
    props.onLongPress();
  };

  const onLongPressReleaseHandler = (type) => {
    props.onLongPressRelease(type);
  };

  const onHoldUpHandler = () => {
    props.onHoldUp();
  };

  const onSwipeUpHandler = () => {
    props.onSwipeUp();
  };

  const onSwipeDownHandler = () => {
    props.onSwipeDown();
  };

  const onPressOutHandler = (event, gesture) => {
    Animated.parallel([
      Animated.spring(progress, {toValue: 0.5, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1, useNativeDriver: true}),
    ]).start();

    if (holdTimeout && !buttonHeldIn) {
      onPressHandler();
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
    if (gesture.dy < -SWIPE_UP_TRIGGER_DISTANCE_MAX && buttonHeldIn) {
      onHoldUpHandler();
      onLongPressReleaseHandler('heldUp');
    } else if (gesture.dy < -SWIPE_UP_TRIGGER_DISTANCE_MAX) {
      onSwipeUpHandler();
    } else if (gesture.dy >= 30) {
      onSwipeDownHandler();
    } else if (buttonHeldIn) {
      onLongPressReleaseHandler('swipedUp');
    }
    console.log(gesture.dy);
    resetPosition();
    setButtonHeldIn(false);
  };

  const animatedValue = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !buttonHeldIn,
      onPanResponderGrant: () => {
        holdTimeout = setTimeout(onLongPressHandler, 500);
      },
      onPanResponderMove: (event, gesture) => {
        if (
          holdTimeout != null &&
          (gesture.dy * -1 >= SWIPE_UP_TRIGGER_DISTANCE_MIN || gesture.dy >= 0)
        ) {
          clearTimeout(holdTimeout);
          holdTimeout = null;
        }
        // if (buttonHeldIn) return;
        animatedValue.setValue({
          x: 0,
          y: scaleLinearYAnimation(
            gesture.dy,
            SWIPE_UP_TRIGGER_DISTANCE_MIN,
            SWIPE_UP_TRIGGER_DISTANCE_MAX,
          ),
        });
      },
      onPanResponderRelease: onPressOutHandler,
    }),
  ).current;

  const resetPosition = () => {
    Animated.spring(animatedValue, {
      toValue: {
        x: 0,
        y: 0,
      },
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.mainButton,
        {
          width: props.size,
          height: props.size,
          transform: [
            {translateY: animatedValue.y},
            {scale},
            {
              rotate: progress.interpolate({
                inputRange: [0.5, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          // borderRadius: progress.interpolate({
          //   inputRange: [0.5, 1],
          //   outputRange: [props.size / 2, props.size / 4],
          // }),
          borderRadius: props.size / 2,
        },
      ]}
      {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.mainButtonSwipeUpStyle,
          {
            opacity: animatedValue.y.interpolate({
              inputRange: [-50, 0],
              outputRange: [1, 0],
            }),
            transform: [
              {
                rotate: animatedValue.y.interpolate({
                  inputRange: [-112, 0],
                  outputRange: ['360deg', '0deg'],
                }),
              },
              {
                scale: animatedValue.y.interpolate({
                  inputRange: [-112, 50],
                  outputRange: [1, 0],
                }),
              },
            ],
            width: props.size,
            height: props.size,
            borderRadius: props.size / 2,
          },
        ]}>
        <Ionicons
          name="chatbubble-ellipses"
          size={40}
          color={buttonHeldIn ? colors.subtlePink : colors.red}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.mainButtonAssistantIcon,
          {
            width: props.size,
            height: props.size,
            opacity: animatedValue.y.interpolate({
              inputRange: [-115, 0],
              outputRange: [0, 1],
            }),
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [1, 0],
                }),
              },
            ],
            borderRadius: props.size / 2,
          },
        ]}>
        <FontAwesome5 name="microphone" size={40} color={colors.red} />
      </Animated.View>
      <Animated.View
        style={[
          styles.mainButtonHoldStyle,
          {
            opacity: progress.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0, 1],
            }),
            transform: [
              {
                scale: animatedValue.y.interpolate({
                  inputRange: [-112, 50],
                  outputRange: [0, 1.5],
                }),
              },
            ],
            width: props.size,
            height: props.size,
            borderRadius: props.size / 2,
          },
        ]}>
        <FontAwesome5 name="microphone" size={40} color={colors.subtlePink} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  mainButtonAssistantIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.subtlePink,
  },
  mainButtonSwipeUpStyle: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.subtlePink,
  },
  mainButtonHoldStyle: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.red,
  },
});
