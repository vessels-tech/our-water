import React, {Component} from 'react'
import { gql, graphql } from 'react-apollo'
import {withRouter} from 'react-router-dom'

import { Loading } from './common'

class ThreadDetailPage extends Component {

  state = {
    answer: ''
  }

  handleClose = async (answered) => {
    await this.props.updateThread({
      variables: {
        id: this.props.data.Thread.id,
        answered: answered
      }
    });
    //TODO: optimistically update button
  }

  submitAnswer = async () => {
    //TODO: clear state
    const posts = this.props.data.Thread.posts.slice();
    posts.push(this.state.answer);

    await this.props.submitAnswer({
      variables: {
        id: this.props.data.Thread.id,
        posts:posts
      }
    });

    //TODO: might have side affects when we add things to state
    this.setState({
      answer:''
    });
  }

  getQuestion() {
    const { Thread } = this.props.data;

    return (
      <h4>
        {Thread.posts[0]}
      </h4>
    );
  }

  getImage() {
    const { Thread } = this.props.data;

    if (!Thread.imageUrl || Thread.imageUrl.indexOf('http') === -1) {
      return null;
    }

    return (
      <div
        className='image'
        style={{
          backgroundImage: `url(${Thread.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBottom: '50%',
        }}
      />
    );
  }

  getTags() {
    const { Thread } = this.props.data;


    const tagPills = Thread.tags.map(tag => {
      return (
        <a className="ma1 f6 link dim br-pill ba ph3 pv2 mb2 dib black" href="#0" key={tag}>{tag}</a>
      )
    })

    return (
      <div className="mt4">
        <h1 className="f6 fw6 ttu tracked">Tags</h1>
        {tagPills}
      </div>
    )
  }

  /**
   * If the question is unanswered, make it red, otherwise make it green!
   */
  getAnsweredButton() {
    const { Thread } = this.props.data;

    if (Thread.answered) {
      return (
        <div className='answered ttu white pointer fw6 br2' onClick={() => this.handleClose(false)}>
          This question has been answered
        </div>
      );
    }

    return (
      <div className='unanswered ttu white pointer fw6 br2' onClick={() => this.handleClose(true)}>
        Mark as answered
      </div>
    );
  }

  getAnswers() {
    const { Thread } = this.props.data;

    const answers = Thread.posts.map((post, idx) => {
      if (idx === 0) {
        return null;
      }

      return (
        <li className="lh-copy pv3 ba bl-0 bt-0 br-0 b--dotted b--black-30"
            key={encodeURIComponent(post)}>
            {post}
        </li>
      );
    });

    return (
      <div>
        <p className="f6 b db mb2 center">Answers:</p>
        <ul className="list pl0 center">
          {answers}
        </ul>
      </div>
    );
  }

  getAnswerField() {
    const { Thread } = this.props.data;

    //Disable the field if the question has been marked as answered
    if (Thread.answered) {
      return null;
    }

    const baseClass = "tc items-center fl w-100 pa2 f6 link ba bw1 ph3 pv2 mb2 dib dark-green";
    let button = (
      <div className={baseClass + ' disable'} disabled="true">Submit</div>
    );

    if (this.state.answer !== '') {
      button = (
        <div className={baseClass + ' dim'} onClick={this.submitAnswer}>Submit</div>
      );
    }

    return (
      <div className='bg-white ma3 post flex flex-column no-underline br2' style={{padding: 20}}>
        <textarea id="comment" name="comment" placeholder="Your Answer"
          className="db border-box hover-black w-100 ba b--black-20 pa2 br2 mb2"
          aria-describedby="comment-desc"
          value={this.state.answer}
          onChange={e => this.setState({answer: e.target.value})}
          >
          </textarea>
        {button}
      </div>
    );
  }

  render() {
    if (this.props.data.loading) {
      return <Loading/>
    }

    const { Thread } = this.props.data;

    return (
      <div>
        <div
          className='bg-white ma3 post flex flex-column no-underline br2'
          style={{padding: 20}}
        >
          {this.getImage()}
          <h2>Asked by: {Thread.askedBy}</h2>
          <div className='flex items-center black-80 fw3 question'>
            {this.getQuestion()}
          </div>
          {/* TODO: show only to the user who made this post */}
          {this.getAnsweredButton()}
          {this.getTags()}
        </div>
        <div className='bg-white ma3 post flex flex-column no-underline br2' style={{padding: 20}}>
          {this.getAnswers()}
        </div>
        {this.getAnswerField()}
      </div>
    );
  }
}

const markAnsweredMutation = gql`
  mutation updateThread($id: ID!, $answered: Boolean!) {
    updateThread(id: $id, answered: $answered) {
      id
      answered
    }
  }
`

const ThreadQuery = gql`
  query thread($id: ID!) {
    Thread(id: $id) {
      id
      answered
      askedBy
      posts
      tags
      imageUrl
    }
  }
`

const ThreadDetailPageWithData = graphql(ThreadQuery, {
  options: ({match}) => ({
    variables: {
      id: match.params.id,
    },
  }),
})(ThreadDetailPage)

const ThreadDetailPageWithMarkAnswered = graphql(markAnsweredMutation, {name: 'updateThread'})(ThreadDetailPageWithData)

// This is a little flawed as we cant just save a new post, we have to modify the existing ones.
// This will result in issues later on
const submitAnswerMutation = gql`
  mutation submitAnswer($id: ID!, $posts: [String!]!) {
    updateThread(id: $id, posts: $posts) {
      id
      posts
    }
  }
`
const ThreadDetailPageWithSubmitAnswerMutation = graphql(submitAnswerMutation, {name: 'submitAnswer'})(ThreadDetailPageWithMarkAnswered)

export default withRouter(ThreadDetailPageWithSubmitAnswerMutation);
