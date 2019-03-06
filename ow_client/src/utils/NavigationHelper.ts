import { defaultNavigatorStyle, navigateTo } from ".";
import { OwnProps as NewReadingScreenProps } from '../screens/NewReadingScreen';



export const navigateToNewReadingScreen = (props: any, title: string, screenProps: NewReadingScreenProps) => {
  const screenName = 'screen.NewReadingScreen';
  navigateTo(props, screenName, title, screenProps);
}
