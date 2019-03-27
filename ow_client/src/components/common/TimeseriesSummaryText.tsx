import * as React from 'react'; import { Component } from 'react';
import { View, TouchableNativeFeedback } from "react-native";
import { Text, Icon } from 'react-native-elements';
import { primary } from '../../utils/Colors';
import { surfaceText } from '../../utils/NewColors';

export interface Props {
  heading: string,
  content: string,
  subtitle: string,
  content_subtitle?: string,
  timeStart?: string,
  timeEnd?: string,
  onPress?: () => void
}

export default class TimeseriesSummaryText extends React.PureComponent<Props> {

  render() {
    const { heading, content, subtitle, content_subtitle, timeStart, timeEnd } = this.props;

    return (
      <TouchableNativeFeedback
        disabled={true}
        onPress={() => this.props.onPress ? this.props.onPress() : null}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 5,
            maxHeight: 50,
          }}
        >
          <View
            key={'left_side'}
            style={{
              flex: 3,
              flexDirection: 'column',
              justifyContent: 'space-evenly',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: surfaceText.high, }}>{heading}</Text>
            <Text style={{ fontSize: 10, fontWeight: '100', fontStyle: "italic" }}>{subtitle}</Text>
          </View>

          {timeStart && timeEnd ? 
            <View
              key={'centre'}
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-evenly',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '100', color: surfaceText.high, }}>{timeStart}</Text>
              <Icon
                size={10}
                name={'arrow-downward'}
                iconStyle={{
                  color: primary,
                }}
              />
              <Text style={{ fontSize: 10, fontWeight: '100', }}>{timeEnd}</Text>
            </View> : null
          }

          <View
            key={'right_side'}
            style={{
              flexDirection: 'column',
              justifyContent: 'space-evenly',
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '500', textAlign: 'right', color: surfaceText.high,}}>{content}</Text>
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