import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { gql, graphql } from 'react-apollo'

import { Loading } from './common'
import Thread from './Thread'

class ThreadList extends Component {

  render() {
    if (this.props.data.loading) {
      return <Loading type={'card'}/>
    }

    return (
      <div>
        <div style={{maxWidth: 1150}}>
          {this.props.data.allThreads.map(thread => (
            <Thread
              key={thread.id}
              thread={thread}
              refresh={() => this.props.data.refetch()}
            />
          ))}
        </div>
      </div>
    );
  }
}

const ThreadyQuery = gql`query allThreads($answered: Boolean!) {
  allThreads(orderBy:createdAt_DESC, filter:{
    answered: $answered
  }) {
    id
    askedBy
    posts
    tags
    imageUrl
  }
}`

const ThreadListWithThreadQuery = graphql(ThreadyQuery,{
  options: ({ answered  }) => ({ variables: { answered } }),
})(ThreadList);

export default ThreadListWithThreadQuery;
