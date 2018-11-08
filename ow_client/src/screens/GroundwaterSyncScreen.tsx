import * as React from 'react';
import { Component } from 'react';
import { Button, Text } from 'react-native-elements';
import { ConfigFactory } from '../config/ConfigFactory';
import BaseApi from '../api/BaseApi';
import { View, TouchableNativeFeedback, ToastAndroid, ScrollView, TextStyle } from 'react-native';
import { randomPrettyColorForId, maybeLog, navigateTo } from '../utils';
import { bgLight, primaryDark, primaryText, secondaryLight, secondaryText } from '../utils/Colors';
import { SyncMeta, ActionMeta } from '../typings/Reducer';
import PassiveLoadingIndicator from '../components/common/PassiveLoadingIndicator';
import { TranslationFile } from 'ow_translations/Types';
import { AppState } from '../reducers';
import { UserType } from '../typings/UserTypes';
import { LocationType, Location } from '../typings/Location';
import { connect } from 'react-redux'
import Loading from '../components/common/Loading';
import { isNullOrUndefined } from 'util';
import MapSection, { MapRegion } from '../components/MapSection';
import { MapStateOption } from '../enums';
import * as appActions from '../actions/index';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaybeExternalServiceApi } from '../api/ExternalServiceApi';
import { ResultType, SomeResult } from '../typings/AppProviderTypes';
import { compose } from 'redux';
import { withTabWrapper } from '../components/TabWrapper';



export interface OwnProps {
  navigator: any;
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  // userId: string,
  // userIdMeta: ActionMeta,
  // location: Location,
  // locationMeta: SyncMeta,
  // resources: Resource[],
  // resourcesMeta: SyncMeta,
  // translation: TranslationFile

}

export interface ActionProps {
  addRecent: any,
  loadResourcesForRegion: (api: BaseApi, userId: string, region: Region) => SomeResult<void>,
}


export interface State {
}

class GroundwaterSyncScreen extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  externalApi: MaybeExternalServiceApi;
  state: State = {

  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = props.config.getAppApi();
    this.externalApi = props.config.getExternalServiceApi();

    /* Binds */
    this.sendEmailPressed = this.sendEmailPressed.bind(this);
  }

  sendEmailPressed() {

  }


  render() {

    const headingStyle: TextStyle = {
      paddingTop: 20,
      fontWeight: "600",
      color: primaryDark,
    };

    const sectionStyle = {
      paddingTop: 10,

    }

    return (
      <ScrollView
        style={{
          backgroundColor: bgLight,
          paddingHorizontal: 20,
          // paddingTop: 10,
          // paddingBottom: 10,
        }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Text 
          style={{
            paddingTop: 20,
            fontWeight: '600',
          }}
        >In order to finish saving your groundwater stations to GGMN, you need to manually register them on the GGMN site.</Text>

        <Text style={headingStyle}>Step 1.</Text>
        <Text style={sectionStyle}>Click the "Send Email" button below to send an email to your GGMN account. This email will contain the shapefiles needed to register the groundwater stations</Text>
        <Button
          containerViewStyle={{
            marginTop: 20,
          }}
          buttonStyle={{
            height: 50,
          }}
          color={secondaryText}
          backgroundColor={secondaryLight}
          borderRadius={15}
          onPress={this.sendEmailPressed}
          title={'Send Email'}
        />

        <Text style={headingStyle}>Step 2.</Text>
        <Text style={sectionStyle}>Once you have recieved the email, log into GGMN at https://ggmn.un-igrac.org/ and select "Upload" in the top right corner.</Text>

        <Text style={headingStyle}>Step 3.</Text>
        <Text style={sectionStyle}>Scroll down to 'Import a SufHyd or shape File' select the organisation your account is associated with, and the file from the email.</Text>
        
        <Text style={headingStyle}>Step 4.</Text>
        <Text style={sectionStyle}>Once this is done, log back into GGMN on your device, and you will see that resources have changed color, and and pending reaadings will start to save.</Text>

        <Text style={headingStyle}>Need some help?</Text>
        <Text style={{ paddingBottom: 20, ...sectionStyle }}>Just reach out to ____ at ____. We'd be glad to assist you.</Text>
      </ScrollView>
    );
  }

}

//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...


  return {
    // userId,
    // userIdMeta: state.userIdMeta,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
   
  };
}

// export default connect(mapStateToProps, mapDispatchToProps)(SimpleMapScreen);

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(GroundwaterSyncScreen);
