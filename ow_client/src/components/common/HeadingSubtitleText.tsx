import * as React from 'react'; import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { Text } from 'react-native-elements';

export interface Props {
  heading: string,
  content: string,
  subtitle: string,
  content_subtitle?: string,
  onPress?: () => void
}

export default class HeadingText extends React.PureComponent<Props> {

  render() {
    const { heading, content, subtitle, content_subtitle} = this.props;

    return (
      <TouchableNativeFeedback
        onPress={() => this.props.onPress? this.props.onPress() : null}
      >
        <View 
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 5,
          }}
        >
          <View
            key={'left_side'}
            style={{
              flexDirection: 'column',
            }}
          >
            <Text style={{fontSize: 17, fontWeight: '700' }}>{heading}</Text>
            <Text style={{ fontSize: 10, fontWeight: '100', fontStyle: "italic" }}>{subtitle}</Text>
          </View>

          <View
            key={'right_side'}
            style={{
              flexDirection: 'column',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '100', paddingLeft: 50 }}>{content}</Text>
            {content_subtitle ? 
              <Text 
                style={{ 
                  textAlign: 'right',
                  fontSize: 10,
                  fontWeight: '100',
                  fontStyle: "italic" 
                }}>{content_subtitle}
              </Text> : null
            }
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}