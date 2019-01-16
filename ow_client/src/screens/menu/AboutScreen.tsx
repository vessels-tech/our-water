import * as React from 'react';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';
import { View, StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux'
import { AppState } from '../../reducers';
import { UserType } from '../../typings/UserTypes';
import { compose } from 'redux';
import { TranslationFile } from 'ow_translations';
import HTMLView from 'react-native-htmlview';


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

const styles = StyleSheet.create({
  a: {
    fontWeight: '300',
    color: '#FF3366', // make links coloured pink
  },
});

class AboutScreen extends React.PureComponent<OwnProps & StateProps & ActionProps> {

  render() {
    const { about_html } = this.props.translation.templates;
    
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
        <HTMLView value={about_html} />
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
