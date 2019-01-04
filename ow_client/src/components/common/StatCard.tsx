import * as React from 'react'; import { Component } from 'react';
import {
  View,
} from 'react-native';
import  { Text } from 'react-native-elements';
import { primaryDark } from '../../utils/Colors';

export interface Props {
  highlightColor?: string,
  description?: string,
  value: string,
  title: string,
}

class StatCard extends Component<Props> {

  render() {
    let { highlightColor } = this.props;

    if (!highlightColor || highlightColor === '') {
      highlightColor = primaryDark;
    }

    return (
      <View style={{
        flexDirection: 'column',
        width: 200,
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',

      }}>
        <Text style={{
          flex: 1,
          textAlign: 'center',
        }}
        >
          {this.props.title}
        </Text>
        <Text 
          h3={true} 
          style={{
          flex: 3,
          textAlign: 'center',
          color: highlightColor,
        }}>
          {this.props.value}
        </Text>
        {this.props.description ? 
          <Text style={{
              flex: 1,
              textAlign: 'center',
            }}
          >
            {this.props.description}
          </Text>
          : null
        }
      </View>
    );
  }
}

export default StatCard;