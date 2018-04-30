import React, {Component} from 'react'
import { Link, withRouter } from 'react-router-dom'
import { gql, graphql } from 'react-apollo'
import { Button } from 'react-bootstrap'
import Dropzone from 'react-dropzone'

import { Loading, ThreadImage } from './common'
import Thread from './Thread'
import { uploadFiles } from '../utils/FileUploader'

class ThreadCreate extends Component {

  state = {
    askedBy: '',
    imageUrl: '',
    question: '',
    tagsString: '',
    uploadingImage: false
  }

  onDrop = async(files) => {
    let newState = this.state;
    newState.uploadingImage = true;
    this.setState(newState);

    //TODO: loading indicator stuff
    const uploadedFile = await uploadFiles(files);

    newState = this.state;
    newState.imageUrl = uploadedFile.url;
    newState.uploadingImage = false;
    this.setState(newState);
  }

  submit = async () => {
    const { askedBy, imageUrl, question, tagsString } = this.state;

    //Convert to the correct tags and post formats
    const tags = tagsString.split(',').map(tag => tag.trim());
    const variables = {askedBy:askedBy, imageUrl:imageUrl, posts:[question], tags:tags}
    await this.props.addThread({variables:variables});

    window.location.pathname = '/'
  }

  isInputValid() {
    let isValid = true;

    Object.keys(this.state).forEach(key => {
      const value = this.state[key];
      if (value === '') {
        isValid = false;
      }
    });

    return isValid;
  }

  getImage() {
    if (!this.state.imageUrl) {
      return null;
    }

    return <ThreadImage imageUrl={this.state.imageUrl}/>;
  }

  getSubmitButton() {
    const baseClass = "tc items-center fl w-100 pa2 f6 link ba bw1 ph3 pv2 mb2 dib dark-green";

    console.log(this.isInputValid());

    if (this.isInputValid()) {
      return (
        <div className={baseClass + ' dim'} onClick={this.submit}>Submit</div>
      );
    }

    return (
      <div className={baseClass + ' disable'} disabled="true">Submit</div>
    );
  }

  render() {

    return (
      <div>
        <h2 className='pa4 flex justify-center'>Ask a new question</h2>
        <div className='pa4 flex justify-center bg-white'>
          <div style={{maxWidth: 400}} className=''>
            {!this.state.imageUrl && !this.state.uploadingImage &&
              (<div>
                <p>Image:</p>
                <Dropzone className="dropzone w-100" onDrop={e => this.onDrop(e)}>
                  <p className="pa3 ba mv3 f6 f5-ns lh-copy measure mv0">Drop an image here, or click to select files to upload.</p>
                </Dropzone>
              </div>
              )}
            {this.state.uploadingImage &&
              <p className='pa4 flex justify-center'>Loading...</p>
            }
            {this.getImage()}
            <input
              className='w-100 pa3 mv2'
              value={this.state.askedBy}
              placeholder='Your Name'
              onChange={e => this.setState({askedBy: e.target.value})}
            />
            <input
              className='w-100 pa3 mv2'
              value={this.state.question}
              placeholder='Your Question'
              onChange={e => this.setState({question: e.target.value})}
            />
            <input
              className='w-100 pa3 mv2'
              value={this.state.tagsString}
              placeholder='Tags (comma separated)'
              onChange={e => this.setState({tagsString: e.target.value})}
            />
            {/* TODO:disable until fields are all filled */}
            {this.getSubmitButton()}
          </div>
        </div>
      </div>
    )
  }
}

const addMutation = gql`
  mutation addThread($askedBy: String!, $imageUrl: String!, $posts: [String!]!, $tags: [String!]!) {
    createThread(askedBy: $askedBy, imageUrl: $imageUrl, posts: $posts, tags: $tags) {
      id
      askedBy
      imageUrl
      posts
      tags
    }
  }
`

const ThreadCreateWithMutation = graphql(addMutation, {name: 'addThread'})(ThreadCreate)

export default withRouter(ThreadCreateWithMutation)
