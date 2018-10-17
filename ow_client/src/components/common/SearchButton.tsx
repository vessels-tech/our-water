import * as React from 'react'; import { Component } from 'react';

import { TouchableNativeFeedback, View } from "react-native";
import { Text, Icon } from 'react-native-elements';
import { error1, primaryText } from '../../utils/Colors';

export interface Props {
  text: string,
  navigator: any,
  onPress: () => () => void,
}

class SearchButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    console.log('searchbutton props: ', this.props);

    return (
      <TouchableNativeFeedback
        style={{
          borderRadius: 25,
        }}
        onPress={() => this.props.onPress && this.props.onPress()}
      >
        <View
          style={{
            // backgroundColor: 'tomato',
            width: 50,
            height: 50,
            marginTop: 5,
          }}
          >
          <Icon
            containerStyle={{
              paddingTop: 10,
            }}
            name='search'
            color={primaryText}
          />
        </View>
      </TouchableNativeFeedback>
    )
  }
}

export default SearchButton;