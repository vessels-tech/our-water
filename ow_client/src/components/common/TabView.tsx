import * as React from 'react';
import { Component } from 'react';
import { ViewProps, View } from "react-native";

export interface Props {
  tabLabel: { type: TabType, name: string},
  children: any,
}

/**
 * Lazily killing two birds here by
 * adding in the icon names.
 */
export enum TabType {
  Summary = "dashboard",
  Graph = "show-chart",
  Table = "view-list",
}


const TabView = (props: ViewProps & Props) => {
  return (
    <View
      {...props}
    >
      {props.children}
    </View>
  );
}


export default TabView;