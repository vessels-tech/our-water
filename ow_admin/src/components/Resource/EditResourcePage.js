import React, { Component } from 'react'
// import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types'
import { throttle } from 'throttle-debounce'
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
const plugins = { dvr: validatorjs };
// import {Form, Field} from 'simple-react-form'

// import 'simple-react-form-material-ui'

import { Loading } from '../common'
import EditResourceForm from './EditResourceForm'
import FirebaseApi from '../../FirebaseApi';
const orgId = process.env.REACT_APP_ORG_ID;


class EditResourcePage extends Component {

  constructor(props) {
    super(props);

    const isNew = this.props.match.params.resourceId === 'new';
    const resourceId = isNew ? null : this.props.match.params.resourceId;

    console.log(FirebaseApi);

    this.state = {
      editing: true,
      isNew,
      resourceId,
      resource: {

      }
    };
  }

  handleEditOrSavePressed() {
    const { editing } = this.state;

    this.setState({
      editing: !editing
    });
  }

  getHeader() {
    const { isNew, resourceId } = this.state;

    return (
      <h2 className="f3 f2-m f1-l light-red">
        {isNew ? "Create a new Resource"
          : `Edit Resource: ${resourceId}`
        }
      </h2>
    );
  }

  getForm() {
    const { editing, resource } = this.state;
    // const { resource } = this.props.data;

    let latitude = null;
    let longitude = null;
    if (resource && resource.coords) {
      latitude = resource.coords.latitude;
      longitude = resource.coords.longitude;
    }

    const fields = {
      type: {
        label: 'Resource Type',
        disabled: !editing,
        extra: [
          'well',
          'raingauge',
          'checkdam'
        ],
        initial: resource.type,
        rules: 'required'
      },
      //TODO: figure out how to nest fields here.
      // coords: {
        latitude: {
          label: 'Latitude',
          disabled: !editing,
          initial: latitude,
          rules: 'required|numeric|between:-90,90'
        },
        longitude: {
          label: 'Longitude',
          disabled: !editing,
          initial: longitude,
          rules: 'required|numeric|between:-180,180'
        },
      // },
      owner: {
        label: 'Owner Name',
        disabled: !editing,
        initial: resource.owner,
        rules: 'required|string'
      },
      disabled: {
        disabled: !editing
      }
    };

    const hooks = {
      onSuccess(form) {
        // get field values
        console.log('Form Values!', form.values());

        //Clean up form data to match required data:
        const resourceData = form.values();
        resourceData.coords = {latitude: resourceData.latitude, longitude: resourceData.longitude};
        resourceData.owner = {name: resourceData.owner};

        delete resourceData.latitude;
        delete resourceData.longitude;
        delete resourceData.disabled;

        console.log('resourceData', resourceData);

        FirebaseApi.createNewResource({orgId, resourceData});
      },
      onError(form) {
        alert('Form has errors!');
        // get all form errors
        console.log('All form errors', form.errors());
      },
      onReset(form) {
        console.log('resetting');

        //Manually set the select
        form.update({ 'type': resource.type });
      }
    };

    const form = new MobxReactForm({ fields }, { plugins, hooks });

    return (
      <EditResourceForm className="pa4 black-80 w-80" form={form} />
    );
  }

  getButtons() {
    const { editing } = this.state;

    return (
      <div>
        <button
          className="f6 mr3 link dim br1 ba ph3 pv2 mb2 dib mid-gray bg-washed-red"
          onClick={() => this.handleEditOrSavePressed()}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <button
          className="f6 link dim br1 ba ph3 pv2 mb2 dib pointer bg-washed-red"
        >
          Delete
        </button>
      </div>
    );
  }

  
  render() {
    const { loading, data, } = this.props;

    // if (data.loading) {
    //   return <Loading />
    // }

    // if (!data.resource) {
    //   return (
    //     <div className="center w-80">
    //       <h3 className="tc mt5">Sorry, this resource could not be found</h3>
    //     </div>
    //   );
    // }

    return (
      <div className="f6 w-100 mw6 center">
        {this.getHeader()}
        {this.getButtons()}
        {this.getForm()}
      </div>
    );
  }
}

export default EditResourcePage;
