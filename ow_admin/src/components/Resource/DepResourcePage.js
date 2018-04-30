import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types'
import { throttle } from 'throttle-debounce';

import ResourceList from './ResourceList'
import { Loading } from '../common'


class ResourcePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      filterQuery: ''
    }
  }

  handleFilterChanged(event) {
    this.setState({filterQuery: event.target.value});
  }

  getKeywordRepresentation(resource) {
    return Object.values(resource).reduce((acc, value) => acc + ' ' + value, '');
  }

  applyFilter(resources) {
    const { filterQuery } = this.state;

    if (filterQuery.length < 3) {
      return resources;
    }

    return resources.filter(resource => this.getKeywordRepresentation(resource).indexOf(filterQuery) > -1);
  }

  getFilterComponent() {
    return (
      <div className="f6 w-100 mw8 center">
        <label className="f6 b db mb2">Filter this list <span className="normal black-60"></span></label>
        <input
          id="filterQuery"
          className="input-reset ba b--black-20 pa2 mb2 db w-100"
          type="text"
          aria-describedby="filterQuery"
          // TODO: this isn't working
          onChange={(event) => throttle(1000000, this.handleFilterChanged(event))}
        />
      </div>
    );
  }

  render() {
    if (this.props.data.loading) {
      return <Loading/>
    }

    return (
      <div className="pa4">
        {this.getFilterComponent()}
        <ResourceList resources={this.applyFilter(this.props.data.resources)}/>
      </div>
    )
  }
}

const AllResourceQuery = gql`
  query {
    resources {
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

const ResourcePageWithAllResourceQuery = graphql(AllResourceQuery, {
})(ResourcePage);

export default ResourcePageWithAllResourceQuery;
