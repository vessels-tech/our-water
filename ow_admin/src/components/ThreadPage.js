import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { gql, graphql } from 'react-apollo'

import { Loading } from './common'
import Thread from './Thread'
import ThreadList from './ThreadList'

class ThreadPage extends Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.location.key !== nextProps.location.key) {
      this.props.data.refetch()
    }
  }

  render() {
    let blurClass = ''

    if (this.props.location.pathname !== '/') {
      blurClass = ' blur'
    }

    return (
      <div className={' justify-center pa2' + blurClass}>
        <h2>New Questions</h2>
        <Link
          to='/create'
          className='ma3 new-post br2 flex flex-column items-center justify-center ttu fw6 f20 black-30 no-underline'
          style={{padding: 20}}
        >
          <img
            src={require('../assets/plus.svg')}
            alt=''
            className='plus mb3'
          />
          <div>Ask a new question</div>
        </Link>
        <ThreadList answered={false}/>
        <h2>Answered Questions</h2>
        <ThreadList answered={true}/>
        {this.props.children}
      </div>
    );
  }
}

export default ThreadPage;
