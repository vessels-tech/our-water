import * as React from 'react';
import { PureComponent } from "react";

//@ts-ignore
import { callingCountries } from 'country-data';
import { View, TextInput, Picker } from 'react-native';
import { splitInternationalNumber } from '../../utils';
import { ResultType } from '../../typings/AppProviderTypes';

export interface Props { 
  onValueChange: (mobileText: string) => void;
  value?: string,
}

export interface State {
  country: CallingCountry,
  countryCodeText: string,
  mobileText: string,
}

export type CallingCountry = {
  emoji: string,
  countryCode: string,
  name: string,
}

function arraymove(arr: any[], fromIndex: number, toIndex: number) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

//Make india first
const countries: CallingCountry[] = callingCountries.all.map((c: any) => ({ emoji: c.emoji, name: c.name, countryCode: c.countryCallingCodes[0]}));
let indiaIdx = 0;
countries.forEach((country, idx) => {
  if (country.name === "India") {
    indiaIdx = idx;
  }
});
arraymove(countries, indiaIdx, 0);

class PhoneNumberEntry extends PureComponent<Props> {
  state: State;
  phone: any;
  countryPicker: any;

  constructor(props: Props) {
    super(props);
    this.state = this.getInitialState(props);

    /* binds */
    this.updatePickerValue = this.updatePickerValue.bind(this);
    this.updateCountryFromCode = this.updateCountryFromCode.bind(this);
    this.updateMobile = this.updateMobile.bind(this);    
  }

  getInitialState(props: Props): State {
    let defaultState: State = {
      country: { emoji: '🇮🇳', countryCode: '+91', name: "India" },
      countryCodeText: '+91',
      mobileText: '',
    };

    if (!props.value) {
      return defaultState;
    }
    
    const splitNumberResult = splitInternationalNumber(props.value);
    if (splitNumberResult.type === ResultType.ERROR) {
      return defaultState;
    }

    const { prefix, mobile } = splitNumberResult.result;
    const country = countries.find(c => c.countryCode === prefix);
    if (!country) {
      return defaultState;
    }

    return {
      country,
      countryCodeText: prefix,
      mobileText: mobile,
    };
  }

  getMobileText() {
    return `${this.state.country.countryCode}${this.state.mobileText}`
  }

  updatePickerValue(itemValue: CallingCountry, itemIndex: number) {
    this.setState({ country: itemValue, countryCodeText: itemValue.countryCode }, 
      () => this.props.onValueChange(this.getMobileText())
    );
  }

  updateCountryFromCode(code: string) {
    this.setState({countryCodeText: code});
    //TODO: Add a + in front
    const country = countries.filter(c => c.countryCode === code);

    //No match, do nothing.
    if (country.length === 0) {
      return;
    }

    this.setState({country: country[0]}, 
      () => this.props.onValueChange(this.getMobileText())
    );
  }

  updateMobile(mobile: string) {
    this.setState({mobileText: mobile}, 
      () => this.props.onValueChange(this.getMobileText())
    );
  }

  render() {
    return (
      <View
        style={{
        
        }}
      >
        <Picker
          selectedValue={this.state.country}
          style={{ height: 50, flex: 1}}
          onValueChange={this.updatePickerValue}>
          {countries.map(c => (
            <Picker.Item key={c.name} label={`${c.emoji}   ${c.name}`} value={c}/>
          ))}
        </Picker>

        <View style={{flex: 1, flexDirection: 'row'}}>
          <TextInput 
            style={{ flex: 1 }} 
            keyboardType="phone-pad"
            defaultValue={this.state.country.countryCode}
            value={this.state.countryCodeText}
            onChangeText={this.updateCountryFromCode}
          />
          <TextInput
            style={{ flex: 5 }}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            value={this.state.mobileText}
            onChangeText={this.updateMobile}
          />
        </View>
      </View>
    );
  }
}


export default PhoneNumberEntry;