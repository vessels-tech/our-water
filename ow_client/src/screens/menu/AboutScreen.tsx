import * as React from 'react';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
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
  navigator: any;
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

  componentWillMount() {
    const { about_html, about_html_url } = this.props.translation.templates;
    //if about_html is empty, then get the html from the about_html_url
    if ((!about_html || about_html === "") && about_html_url) {
      this.setState({loading: true}, () => {
        return fetch(about_html_url)
          .then((response: any) => {
            if (!response.ok) {
              return Promise.reject(new Error("Response not ok"));
            }

            return response.text();
          })
          .then((html: string) => {

            console.log("got text", html)
            this.setState({
              loading: false,
              html,
            });
          })
          .catch((err: Error) => {
            console.log(err);
          });
      });
    }
  }


  render() {
    const { about_html } = this.props.translation.templates;

    let text = about_html;
    if (about_html === "" && this.state.html) {
      text = this.state.html;
    }

    if (this.state.loading && about_html === "") {
      return <Loading/>
    }

    return (
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <HTMLView value={text} />
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
