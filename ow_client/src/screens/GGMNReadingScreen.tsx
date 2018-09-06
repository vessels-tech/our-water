import * as React from 'react';
import { Component } from "react";
import {
  FormBuilder,
  FieldGroup,
  FieldControl,
  Validators,
} from "react-reactive-form";
import * as moment from 'moment';
import { ConfigFactory } from '../config/ConfigFactory';
import { View, KeyboardAvoidingView, Keyboard, ToastAndroid } from 'react-native';
import { FormInput, Button } from 'react-native-elements';
import BaseApi from '../api/BaseApi';
import IconFormInput, { InputType } from '../components/common/IconFormInput';
import { textMed } from '../utils/Colors';


export interface Props {
  navigator: any,
  config: ConfigFactory,
  userId: string,
  resourceId: string,
}

export interface State {
  loading: boolean,
}

const TextInput = ({ meta, handler }: any) => (
  <View>
    <FormInput 
      secureTextEntry={meta.secureTextEntry} 
      placeholder={`${meta.label}`}
      {...handler()} 
    />
  </View>
);

const DateInput = ({meta, handler}: any) => {
  const resolvedHandler = handler();
  console.log("resolved handler is", resolvedHandler);
  return (
    <View>
      <IconFormInput
        iconName='calendar'
        iconColor={textMed}
        placeholder='Reading Date'
        errorMessage={null}
        // errorMessage={this.isDateValid() ? null : 'Invalid Date'}
        // onChangeText={(date: moment.Moment) => this.setState({ date })}
        // onSubmitEditing={() => console.log('on submit editing')}
        fieldType={InputType.dateTimeInput}
        // value={date}
        value={moment(resolvedHandler.value)}
        onSubmitEditing={() => console.log('onSubmitEditing called')}
        onChangeText={(date: moment.Moment) => 
          { 
            console.log("onChangeText called", date);
            resolvedHandler.onChange({value:date.toISOString()})
          }}
        // {...resolvedHandler} 
          />
    </View>
  );
};

export default class GGMNReadingScreen extends Component<Props> {
  state: State;
  readingForm = FormBuilder.group({
    date: [moment().toISOString(), Validators.required],
    value: ['', Validators.required],
    timeseries: ['', Validators.required],
  });

  appApi: BaseApi;

  constructor(props: Props) {
    super(props);

    this.appApi = this.props.config.getAppApi();
    this.state = {
      loading: true,
    };

    //TODO: load the resource from the api
  }

  handleSubmit = () => {
    Keyboard.dismiss();
    this.setState({ loading: true });

    //TODO: save the reading to GGMN api.

    ToastAndroid.show(`TODO: save your reading`, ToastAndroid.SHORT);
  }

  getForm() {
    const { loading } = this.state;

    return (
      <FieldGroup
        strict={false}
        control={this.readingForm}
        render={({ get, invalid }) => (
          <View>
            <FieldControl
              name="date"
              render={DateInput}
              meta={{ label: "Reading Date", secureTextEntry: false }}
            />
            <FieldControl
              name="timeseries"
              render={TextInput}
              meta={{ label: "Timeseries", secureTextEntry: false }}
            />
            <FieldControl
              name="value"
              render={TextInput}
              meta={{ label: "Value", secureTextEntry: false }}
            />
            <Button
              style={{
                paddingBottom: 20,
              }}
              loading={loading}
              disabled={invalid}
              title={loading ? '' : 'Submit'}
              onPress={() => this.handleSubmit()}
            />
          </View>
        )}


      />
    )
  }

  render() {

    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={10}
      >
        {this.getForm()}
      </KeyboardAvoidingView>
    )

  }

}