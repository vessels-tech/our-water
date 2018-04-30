import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types'
import { throttle } from 'throttle-debounce'
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
const plugins = { dvr: validatorjs };
import moment from 'moment';

import { Loading } from '../common'
import EditClientForm from './EditClientForm'

class EditClientPage extends Component {

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
    const { client } = this.props.data;

    return (
      <div>
        <h1 className="f3 f2-m f1-l light-red">ClientId: {client.id}</h1>
        {/* <h2>Created at: {moment(client.created).format('DD MM YY')}</h2> */}
        {/* <h2>Updated at: {moment(client.lastUpdated).format('DD MM YY')}</h2> */}
      </div>
    );
  }

  getForm() {
    const { editing } = this.state;
    const { client } = this.props.data;

    const fields = {
      id: {
        label: 'Client Id',
        disabled: true,
        initial: client.id,
      },
      username: {
        label: "Username",
        disabled: true,
        initial: client.username
      },
      mobileNumber: {
        label: "Mobile Number (optional)",
        disabled: !editing,
        initial: client.mobileNumber
      },
      email: {
        label: "Email (optional)",
        disabled: !editing,
        initial: client.email
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
    };

    const form = new MobxReactForm({ fields }, { plugins, hooks });

    return (
      <EditClientForm className="pa4 black-80 w-80" form={form} />
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

    if (!this.props.data.client) {
      return (
        <div className="center w-80">
          <h3 className="tc mt5">Sorry, this user could not be found</h3>
        </div>
      );
    }

    return (
      <div className="f6 w-100 mw6 center">
        {this.getHeader()}
        {this.getButtons()}
        {this.getForm()}
        <p>This Client's Resources:</p>
      </div>
    );
  }
}

const ClientQuery = gql`
  query client($id: Int!) {
      client(id: $id) {
        id
        mobileNumber
        username
        email
        created
        lastUpdated
      }
  }
`

const EditClientPageWithClientQuery = graphql(ClientQuery, {
  options: ({match}) => ({
    variables: {
      id: match.params.id,
    },
  }),
})(EditClientPage)

export default EditClientPageWithClientQuery;
