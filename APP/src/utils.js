export const scaleLinearYAnimation = (val, minVal, maxVal) => {
  return val > 0
    ? Math.min(val, 30)
    : -(Math.min(Math.abs(val), minVal) * minVal) / maxVal;
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function isNumber(n) {
  if (n === ' ') return false;
  if (n.trim().length === 0) return false;
  return !isNaN(n);
}

export function formatQuery(query) {
  let regexForCitation = /\[\^(.*?)\^\]/g;
  let regexForBold = /\*\*(.*?)\*\*/g;
  let arr = query.split(regexForCitation);
  let new_arr = [];
  for (let x of arr) {
    if (x === undefined) {
      new_arr.push({type: 'string', value: '. '});
      continue;
    } else {
      if (isNumber(x)) {
        new_arr.push({
          type: 'citation',
          value: x,
        });
        continue;
      }
      let bold_arr = x.split(regexForBold);
      if (bold_arr.length === 1) {
        new_arr.push({
          type: 'string',
          value: x,
        });
      } else {
        for (let i = 0; i < bold_arr.length; i++) {
          if (bold_arr[i] === undefined) {
            new_arr.push({type: 'string', value: '. '});
            continue;
          }
          new_arr.push({
            type: i % 2 === 0 ? 'string' : 'boldString',
            value: bold_arr[i],
          });
        }
      }
    }
  }
  console.log(new_arr);
  return new_arr;
}

export const generateBoxShadowStyle = (
  xOffset,
  yOffset,
  shadowRadius,
  shadowOpacity,
  shadowColor,
  elevation,
) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowColor,
      shadowOffset: {width: xOffset, height: yOffset},
      shadowOpacity,
      shadowRadius,
    };
  } else if (Platform.OS === 'android') {
    return {
      elevation,
      shadowColor: shadowColor,
    };
  }
};

export function getCurrentTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
