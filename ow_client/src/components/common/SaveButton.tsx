import * as React from 'react';
import { Button } from "react-native-elements";
import { secondaryText, secondary } from '../../utils/NewColors';


export interface Props {
  loading: boolean,
  disabled: boolean,
  title: string,
  height?: number,
  onPress: () => void,
  textColor?: string,
  backgroundColor?: string,
  icon?: any,
}

export default function SaveButton(props: Props) {
  const {
    loading,
    disabled,
    title,
    height,
    onPress,
    textColor,
    backgroundColor,
    icon,
  } = props;

  return (
    <Button
      raised={true}
      style={{
        paddingBottom: 20,
        height,
      }}
      buttonStyle={{
        backgroundColor: backgroundColor || secondary,
      }}
      containerViewStyle={{
        marginVertical: 20,
        opacity: 1,
      }}
      textStyle={{
        color: textColor || secondaryText.high,
        fontWeight: '700',
      }}
      loading={loading}
      disabled={disabled}
      title={loading ? '' : title}
      icon={icon || null}
      onPress={() => onPress()}
    />
  )

}