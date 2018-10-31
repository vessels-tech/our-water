import * as React from 'react'; import { Component } from 'react';

import { ProgressBarAndroid } from "react-native";
import { primaryLight } from "../../utils/Colors";

const PassiveLoadingIndicator = () => {
  return (
    <ProgressBarAndroid
      styleAttr="Horizontal"
      indeterminate={true}
      color={primaryLight}
      style={{
        marginVertical: -6,
        position: 'absolute',
        zIndex: 10,
        top: 0,
        left: 0,
        right: 0,
      }}
    />
  )
}

export default PassiveLoadingIndicator;