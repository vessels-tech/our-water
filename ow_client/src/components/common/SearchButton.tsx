import * as React from 'react'; import { Component } from 'react';

import { TouchableNativeFeedback, View } from "react-native";
import { Text, Icon } from 'react-native-elements';
import { AppState } from '../../reducers';
import { ConfigFactory } from '../../config/ConfigFactory';
import { TranslationFile } from 'ow_translations';
import { connect } from 'react-redux'
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import { SearchButtonPressedEvent } from '../../utils/Events';
import { primaryText } from '../../utils/NewColors';



export interface Props {
  text: string,
}

export interface OwnProps {
  config: ConfigFactory,
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

class SearchButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <TouchableNativeFeedback
        style={{
          borderRadius: 25,
        }}
        onPress={() => {
          EventEmitter.emit(SearchButtonPressedEvent, 'SEARCH');
        }}
      >
        <View
          style={{
            // backgroundColor: 'tomato',
            width: 50,
            height: 50,
            marginTop: 5,
          }}
          >
          <Icon
            containerStyle={{
              paddingTop: 10,
            }}
            name='search'
            color={primaryText.high}
          />
        </View>
      </TouchableNativeFeedback>
    )
  }
}

export default SearchButton;

// const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
//   return {
//     translation: state.translation,
//   }
// }

// export default connect(mapStateToProps, () => ({}))(SearchButton);