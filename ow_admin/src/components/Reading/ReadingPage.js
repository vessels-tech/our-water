import React, { Component } from 'react'
import { Loading } from '../common'
import Link from 'react-router-dom/Link';

import FirebaseApi from '../../FirebaseApi';

const orgId = process.env.REACT_APP_ORG_ID;


class ReadingPage extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }
  

  render() {
    if (this.state.loading) {
      return <Loading />
    }

    return (
      <div>
        <Link to='/reading/upload/'>Upload Past Readings</Link>
      </div>
    );
  }

}

export default ReadingPage;