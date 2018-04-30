import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { ThreadImage } from './common'

class Thread extends Component {

  getTags() {
    const tagPills = this.props.thread.tags.map(tag => {
      return (
        <div className="ma1 f6 link dim br-pill ba ph3 pv2 mb2 dib black" href="#0" key={tag}>{tag}</div>
      )
    })

    return (
      <div className="ph3 mt4">
        <h1 className="f6 fw6 ttu tracked">Tags</h1>
        {tagPills}
      </div>
    )
  }

  render() {
    return (
      <Link
        className='bg-white ma3 post flex flex-column no-underline br2'
        style={{padding: 20}}
        to={`/thread/${this.props.thread.id}`}
      >
        <h3>Asked By: {this.props.thread.askedBy}</h3>
        <div className='flex items-center black-80 fw3 question pa2'>
          {this.props.thread.posts[0]}
        </div>
        <ThreadImage imageUrl={this.props.thread.imageUrl}/>
        {this.getTags()}
      </Link>
    );
  }
}


export default Thread;
