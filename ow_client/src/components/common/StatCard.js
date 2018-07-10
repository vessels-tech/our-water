import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  FormInput,
  Input,
  FormLabel,
  FormValidationMessage,
  Button,
  Text,

} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { primary, primaryDark } from '../../utils/Colors';


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
        <Text h3 style={{
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

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.any,
  description: PropTypes.string,
  highlightColor: PropTypes.string,
}

export default StatCard;