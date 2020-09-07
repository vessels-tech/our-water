import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux'
import { AppState } from '../../reducers';
import * as appActions from '../../actions/index';
import { TranslationEnum, TranslationFile, TranslationFiles, TranslationOrg } from 'ow_translations';
import * as EnvConfig from '../../utils/EnvConfig';
import { possibleTranslationsForOrg, translationsForTranslationOrg } from 'ow_translations';
import UserApi from '../../api/UserApi';
import { SomeResult } from '../../typings/AppProviderTypes';
import { View, Picker, ToastAndroid } from 'react-native';
import { Text } from 'react-native-elements';
import { ConfigFactory } from '../../config/ConfigFactory';
import { bgLight } from '../../utils/Colors';
import { crashlyticsLog } from '../../utils';

export interface OwnProps {
  config: ConfigFactory,
  userId: string
}

export interface StateProps {
  selectedTranslation: TranslationEnum,
  translation: TranslationFile,
  translations: TranslationFiles,
  translationOptions: TranslationEnum[],
}

export interface ActionProps {
  changeTranslation: (api: UserApi, userId: string, translation: TranslationEnum) => Promise<SomeResult<void>>
}


export interface State {

}

class ClassName extends Component<OwnProps & StateProps & ActionProps> {
  userApi: UserApi;
  state: State = {

  };

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.userApi = props.config.userApi;
  }

  getTranslationLabel(tr: TranslationEnum) {
    //@ts-ignore
    const translation: TranslationFile = this.props.translations[tr];
    if (!translation) {
      return '';
    }
    let subtitle = "";
    if (translation.metadata.region !== "") {
      subtitle = `(${translation.metadata.region})`;
    }

    return `${translation.metadata.language} ${subtitle}`
  }

  render() {
    const { selectedTranslation } = this.props;
    const {
      select_language_heading,
      select_language_popup,
    } = this.props.translation.templates

    return (
      <View
        style={{
          flexDirection: 'column',
          height: '50%',
          width: '85%',
          backgroundColor: bgLight,
        }}>
        <Text
          style={{
            alignSelf: 'center',
            fontSize: 18,
            fontWeight: '900',
            flex: 1,
            paddingTop: 10,
          }}>
          {select_language_heading}
        </Text>
        <Picker
          selectedValue={selectedTranslation}
          style={{
            flex: 2
          }}
          mode={'dropdown'}
          onValueChange={async (translation: TranslationEnum) => {
            await this.props.changeTranslation(this.userApi, this.props.userId, translation);
            crashlyticsLog(`Changed Language to: ${this.getTranslationLabel(translation)}`);
            ToastAndroid.show(select_language_popup(this.getTranslationLabel(translation)), ToastAndroid.SHORT);
          }}
        >
          {this.props.translationOptions.map(tr => <Picker.Item key={tr} label={this.getTranslationLabel(tr)} value={tr} />)}
        </Picker>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  return {
    selectedTranslation: state.language,
    translation: state.translation,
    translations: state.translations,
    translationOptions: state.translationOptions,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    changeTranslation: (api: UserApi, userId: string, translation: TranslationEnum) =>
      dispatch(appActions.changeTranslation(api, userId, translation))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassName);
