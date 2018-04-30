import React, { Component } from 'react'
import { Loading } from '../common'
import Link from 'react-router-dom/Link';

import FirebaseApi from '../../FirebaseApi';

const orgId = process.env.REACT_APP_ORG_ID;

class ResourcePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({loading:true});
  
    return FirebaseApi.getResourcesForOrg({orgId})
      .then(data => {
        console.log(data);
        this.setState({data})
      })
      .catch(err => console.log(err))
      .then(() => this.setState({loading:false}))
  }

  getResourceRow(resource) {
    return (
      <div key={resource.id}>
        {resource.id}
      </div>
    );
  }

  getResourceList() {
    const { data } = this.state;

    return (
      <div>
        <h3>Resources:</h3>
        {data.map(resource => this.getResourceRow(resource))}
      </div>
    );
  }

  render() {
    if (this.state.loading) {
      return <Loading />
    }

    return (
      <div>
        {this.getResourceList()}
        <Link to='/resource/edit/new'>New Resource</Link>
      </div>
    );
  }
}

export default ResourcePage;