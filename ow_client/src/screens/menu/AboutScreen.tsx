import * as React from 'react';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';
import { View, StyleSheet, ScrollView, Dimensions, WebView } from 'react-native';
// import { WebView } from 'react-native-webview';
import { connect } from 'react-redux'
import { AppState } from '../../reducers';
import { UserType } from '../../typings/UserTypes';
import { compose } from 'redux';
import { TranslationFile } from 'ow_translations';
import HTMLView from 'react-native-htmlview';
import Loading from '../../components/common/Loading';
//@ts-ignore
// import { default as ftch } from '../../utils/Fetch';

import { naiveParseFetchResponse } from '../../utils';

const SCREEN_WIDTH = Dimensions.get('window').width;


export interface OwnProps {
  config: ConfigFactory,
  appApi: BaseApi,
}

export interface StateProps {
  userId: string,
  translation: TranslationFile,
}

export interface ActionProps {

}

export interface State {
  loading: false,
  html: string | null,
}

const styles = StyleSheet.create({
  a: {
    fontWeight: '300',
    // color: '#FF3366', // make links coloured pink
  },
});

class AboutScreen extends React.PureComponent<OwnProps & StateProps & ActionProps> {
  state: State;

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    this.state = {
      loading: false,
      html: null,
    }
  }



  render() {
    const { about_html, about_html_url } = this.props.translation.templates;

    const externalAboutPage = about_html === "";

    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {
            externalAboutPage ? 
              <WebView
                source={{ uri: about_html_url }}
                style={{

                }}
              />
              :
              <View style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}>
                <HTMLView value={about_html}/>
              </View>
          }
        </View>
      </ScrollView>
    );
  }
}


//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
  let userId = ''; //I don't know if this fixes the problem...

  if (state.user.type === UserType.USER) {
    userId = state.user.userId;
  }

  return {
    userId,
    translation: state.translation,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
  }
}


const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
);

export default enhance(AboutScreen);
