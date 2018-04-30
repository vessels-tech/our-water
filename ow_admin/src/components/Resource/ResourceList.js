import React, { Component } from 'react'
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';

class ResourceList extends Component {

  constructor(props) {
    super(props);
  }

  getResourceHeading() {
    return (
      <tr>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Pincode</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">ResourceId</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Resource Type</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Latitude</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Longitude</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Last Value</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Last Reading Date</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">Owner</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3">ClientId</th>
        <th className="fw6 bb b--black-20 tl pb3 pr3"></th>
      </tr>
    );
  }

  getResourceRow(resource) {
    const clientId = resource.clientId ? resource.clientId : '-';
    const editPath = `/resource/edit/${resource.postcode}/${resource.resourceId}`;

    return (
      <tr key={`id:${resource.id},postcode:${resource.postcode}`}>
        <td className="pv3 pr3 bb b--black-20">{resource.postcode}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.resourceId}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.type}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.lat}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.lng}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.lastValue}</td>
        <td className="pv3 pr3 bb b--black-20">{moment(resource.lastDate).format()}</td>
        <td className="pv3 pr3 bb b--black-20">{resource.owner}</td>
        <td className="pv3 pr3 bb b--black-20">{clientId}</td>
        <td className="pv3 pr3 bb b--black-20">
          <Link className="f6 link dim br1 ba ph3 pv2 mb2 dib mid-gray" to={editPath}>Edit</Link>
        </td>
      </tr>
    );
  }

  render() {
    console.log("resources length resourceList:", this.props.resources.length);

    return (
      <div className="pa4">
        <div className="overflow-auto">
          <table className="f6 w-100 mw8 center" cellSpacing="0">
            <thead>
              {this.getResourceHeading()}
            </thead>
            <tbody className="lh-copy">
               {this.props.resources.map(resource => this.getResourceRow(resource))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

ResourceList.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.int,
    postcode: PropTypes.int,
    lat: PropTypes.float,
  }))
};

export default ResourceList;
