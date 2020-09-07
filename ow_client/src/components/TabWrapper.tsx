import * as React from 'react';
import { Component } from 'react';
import { ConfigFactory } from '../config/ConfigFactory';
import { TranslationFile } from 'ow_translations';
//@ts-ignore
import EventEmitter from "react-native-eventemitter";
import { SearchButtonPressedEvent } from '../utils/Events';
import { navigateTo } from '../utils';
import { GGMNSearchEntity } from '../typings/models/GGMN';
import BaseApi from '../api/BaseApi';


export interface OwnProps {
  config: ConfigFactory,
  appApi: BaseApi,
  // children: any,
}

export interface StateProps {
  userId: string,
  translation: TranslationFile,
}

export interface ActionProps {

}

export function withTabWrapper(WrappedComponent: any) {

  return class extends React.Component<OwnProps & StateProps & ActionProps> {
    constructor(props: OwnProps & StateProps & ActionProps) {
      super(props);
      
      EventEmitter.addListener(SearchButtonPressedEvent, this.onNavigatorEvent.bind(this));
    }

    async onNavigatorEvent(event: any) {
      //TODO: push only when this screen is visible
      const isVisible = false // TODO KEVIN
      if (!isVisible) {
        return;
      }

      // const { translation: { templates: { search_heading } } } = this.props;
      if (event === "SEARCH") {
        navigateTo(this.props, 'screen.SearchScreen', 'Search', {
          config: this.props.config,
          onSearchResultPressed: (result: GGMNSearchEntity) => this.onSearchResultPressed(result),

        });
      }
      //TD: Co-opting this for the QR search for now.
      // if (event === "SEARCH") {
      //   navigateTo(this.props, 'screen.ScanScreen', 'Search', {
      //     config: this.props.config,
      //   });
      // }
    }

    onSearchResultPressed(result: GGMNSearchEntity) {
      //TODO: make sure we are visible
    }

    render() {
      return <WrappedComponent {...this.props}/>
    }
  }
}