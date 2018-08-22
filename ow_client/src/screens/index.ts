import { Navigation, Screen } from 'react-native-navigation';

import App from '../App';
import NewReadingScreen from './NewReadingScreen';
import ResourceDetailScreen from './ResourceDetailScreen';
import SettingsScreen from './SettingsScreen';
import EditResourceScreen from './EditResourceScreen';


// function registerComponentWithProps(screenId, generator, props) {
//   const generatorWrapper = function () {
//     const InternalComponent = generator();
//     if (!InternalComponent) {
//       console.error(`Navigation: ${screenID} registration result is 'undefined'`);
//     }

//     return class extends Screen {
//       static navigatorStyle = InternalComponent.navigatorStyle || {};
//       static navigatorButtons = InternalComponent.navigatorButtons || {};

//       constructor(props) {
//         super(props);
//         this.state = {
//           internalProps: { ...props, ...PropRegistry.load(props.screenInstanceID || props.passPropsKey) }
//         }
//       }

//       componentWillReceiveProps(nextProps) {
//         this.setState({
//           internalProps: { ...PropRegistry.load(this.props.screenInstanceID || this.props.passPropsKey), ...nextProps }
//         })
//       }

//       render() {
//         return (
//           <InternalComponent testID={screenID} navigator={this.navigator} {...this.state.internalProps} />
//         );
//       }
//     };
//   };

//   Navigation.registerScreen(screenId, generatorWrapper);
//   return generatorWrapper;
// }

export function registerScreens() {
  // registerComponentWithProps('example.FirstTabScreen', () => App, {});
  Navigation.registerComponent('example.FirstTabScreen', () => App);
  Navigation.registerComponent('screen.NewReadingScreen', () => NewReadingScreen);
  Navigation.registerComponent('screen.ResourceDetailScreen', () => ResourceDetailScreen);
  Navigation.registerComponent('screen.MenuScreen', () => SettingsScreen);
  Navigation.registerComponent('screen.EditResourceScreen', () => EditResourceScreen);
}


function _registerComponentNoRedux(screenID, generator) {
  const generatorWrapper = function () {
    const InternalComponent = generator();
    if (!InternalComponent) {
      console.error(`Navigation: ${screenID} registration result is 'undefined'`);
    }

    return class extends Screen {
      static navigatorStyle = InternalComponent.navigatorStyle || {};
      static navigatorButtons = InternalComponent.navigatorButtons || {};

      constructor(props) {
        super(props);
        this.state = {
          internalProps: { ...props, ...PropRegistry.load(props.screenInstanceID || props.passPropsKey) }
        }
      }

      componentWillReceiveProps(nextProps) {
        this.setState({
          internalProps: { ...PropRegistry.load(this.props.screenInstanceID || this.props.passPropsKey), ...nextProps }
        })
      }

      render() {
        return (
          <InternalComponent testID={screenID} navigator={this.navigator} {...this.state.internalProps} />
        );
      }
    };
  };
  registerScreen(screenID, generatorWrapper);
  return generatorWrapper;
}