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



export interface OwnProps {
  navigator: any,
  config: ConfigFactory,
  userId: string,
}

export interface StateProps {
  selectedTranslation: TranslationEnum,
  translation: TranslationFile,
}

export interface ActionProps {
  changeTranslation: (api: UserApi, userId: string, translation: TranslationEnum) => Promise<SomeResult<void>>
}


export interface State {

}

class ClassName extends Component<OwnProps & StateProps & ActionProps> {
  userApi: UserApi;
  translationEnumList: TranslationEnum[];
  allTranslations: TranslationFiles;
  state: State = {

  };

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.userApi = props.config.userApi;
    const orgId = EnvConfig.OrgId;
    this.translationEnumList = possibleTranslationsForOrg(orgId);
    this.allTranslations = translationsForTranslationOrg(orgId);
  }

  getTranslationLabel(tr: TranslationEnum) {
    //this is not type safe!
    //@ts-ignore
    const translation: TranslationFile = this.allTranslations[tr];
    if (!translation) {
      return '';
    }
    return `${translation.metadata.language} (${translation.metadata.region})`
  }

  render() {
    const { selectedTranslation, translation: { templates: { select_language_heading }} } = this.props;

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
            ToastAndroid.show(`Changed Language to: ${this.getTranslationLabel(translation)}`, ToastAndroid.SHORT);
            this.props.navigator.dismissLightBox();
          }}
        >
          {this.translationEnumList.map(tr => <Picker.Item key={tr} label={this.getTranslationLabel(tr)} value={tr} />)}
        </Picker>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  
  return {
    selectedTranslation: state.language,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    changeTranslation: (api: UserApi, userId: string, translation: TranslationEnum) => 
      dispatch(appActions.changeTranslation(api, userId, translation))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassName);