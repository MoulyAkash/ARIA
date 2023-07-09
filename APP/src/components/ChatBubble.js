import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

import {colors} from '../colors';

export default function ChatBubble(props) {
  return (
    <View
      style={[
        styles.chatBubbleContainer,
        {
          marginLeft: props.type === 'user' ? 'auto' : 0,
          marginRight: props.type === 'ai' ? 'auto' : 0,
          backgroundColor: props.type === 'user' ? colors.blue : colors.grey,
        },
      ]}>
      <View style={styles.chatTextContainer}>
        <Text
          style={[
            styles.chatText,
            {color: props.type === 'user' ? 'white' : colors.black},
          ]}>
          {props.value.map((item, index) => {
            if (item.type === 'string')
              return <Text key={index}>{item.value}</Text>;
            if (item.type === 'boldString')
              return (
                <Text key={index} style={{fontWeight: 'bold'}}>
                  {item.value}
                </Text>
              );
            if (item.type === 'citation')
              return (
                <Text
                  key={index}
                  style={{
                    color: colors.blue,
                  }}>
                  {item.value}
                </Text>
              );
          })}
        </Text>
      </View>
      <View style={styles.timeStampContainer}>
        <Text
          style={[
            styles.timeStamp,
            {color: props.type === 'user' ? 'white' : colors.black},
          ]}>
          {props.timeStamp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatBubbleContainer: {
    borderRadius: 15,
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 150,
    maxWidth: 300,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  chatTextContainer: {},
  chatText: {},
  timeStampContainer: {},
  timeStamp: {},
});
