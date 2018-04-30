import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types'
import { throttle } from 'throttle-debounce'
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
const plugins = { dvr: validatorjs };
// import {Form, Field} from 'simple-react-form'

// import 'simple-react-form-material-ui'

import { Loading } from '../common'
import EditResourceForm from './EditResourceForm'

class EditResourcePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
    };
  }

  handleEditOrSavePressed() {
    const { editing } = this.state;

    this.setState({
      editing: !editing
    });
  }


  getHeader() {
    const { resource } = this.props.data;

    return (
      <h1 className="f3 f2-m f1-l light-red">Resource: {resource.resourceId}</h1>
    );
  }


  getForm() {
    const { editing } = this.state;
    const { resource } = this.props.data;

    const fields = {
      postcode: {
        label: 'Pincode',
        disabled: true,
        initial: resource.postcode,
        rules: 'required'
      },
      resourceId: {
        label: 'ResourceId',
        disabled: true,
        initial: resource.resourceId,
        rules: 'required'
      },
      resourceType: {
        label: 'ResourceType',
        disabled: !editing,
        extra: [
          'well',
          'raingauge',
          'checkdam'
        ],
        initial: resource.type,
        rules: 'required'
      },
      lat: {
        label: 'Latitude',
        disabled: !editing,
        initial: resource.lat,
        rules: 'required|numeric'
      },
      lng: {
        label: 'Longitude',
        disabled: !editing,
        initial: resource.lng,
        rules: 'required|numeric'
      },
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
        alert('Form is valid! Send the request here.');
        // get field values
        console.log('Form Values!', form.values());
      },
      onError(form) {
        alert('Form has errors!');
        // get all form errors
        console.log('All form errors', form.errors());
      },
      onReset(form) {
        console.log('resetting');

        //Manually set the select
        form.update({'resourceType':resource.type});
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
          { editing ? 'Cancel' : 'Edit' }
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
    if (this.props.data.loading) {
      return <Loading/>
    }

    if (!this.props.data.resource) {
      return (
        <div className="center w-80">
          <h3 className="tc mt5">Sorry, this resource could not be found</h3>
        </div>
      );
    }

    return (
      <div className="f6 w-100 mw6 center">
        {this.getHeader()}
        {this.getButtons()}
        {this.getForm()}
      </div>
    );
  }
}

const ResourceQuery = gql`
  query resource($postcode: Int!, $resourceId: Int!){
      resource(postcode: $postcode, resourceId: $resourceId) {
        id
        resourceId
        lat
        lng
        lastValue
        wellDepth
        lastDate
        owner
        elevation
        type
        postcode
        clientId
      }
  }
`

const EditResourcePageWithResourceQuery = graphql(ResourceQuery, {
  options: ({match}) => ({
    variables: {
      postcode: match.params.postcode,
      resourceId: match.params.resourceId,
    },
  }),
})(EditResourcePage)

export default EditResourcePageWithResourceQuery;
