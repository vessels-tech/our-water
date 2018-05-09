import React, { Component } from 'react'
import { Loading } from '../common'
import Link from 'react-router-dom/Link';
import Dropzone from 'react-dropzone';

import FirebaseApi from '../../FirebaseApi';
import { FileUploadValidationResults } from '../../enums';
import SimpleButton from '../common/SimpleButton';

const orgId = process.env.REACT_APP_ORG_ID;


class UploadReadingPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filesToUpload: [],
      validationStatus: FileUploadValidationResults.notStarted,
    };
  }

  /* Event Handlers */

  handleFileDrop(files) {
    const { filesToUpload } = this.state;

    console.log('files', files);

    files.forEach(file => filesToUpload.push(file));

    this.setState({
      filesToUpload
    });
  }

  uploadAndValidate() {
    const { filesToUpload } = this.state;

    this.setState({
      validationStatus: FileUploadValidationResults.pending,
    });

    //TODO: upload file
  }

  process() {
    //TODO: get the SyncId, and run without validate option
    
    this.setState({
      validationStatus: FileUploadValidationResults.pending,
    });

  }

  /* Render Extensions */

  getFileDrop() {
    const { filesToUpload } = this.state;

    if (filesToUpload.length > 0) {
      return null;
    }

    return (
      <Dropzone onDrop={files => this.handleFileDrop(files)}>
        <p>Drop your readings .csv/.tsv files here</p>
      </Dropzone>
    );
  }

  getPendingFiles() {
    const { filesToUpload } = this.state;
    
    if (filesToUpload.length === 0) {
      return null;
    }

    return (
      <div>
        <ul>
          {filesToUpload.map(file => (
            <li key={file.preview}>{file.name}</li>
          ))}
        </ul>
      </div>
    )
  }
  
  getSettingsForm() {

    return (
      <div>
        <h3>Settings</h3>

      </div>
    );
  }

  getValidationDialog() {
    const { validationStatus } = this.state;

    if (validationStatus === FileUploadValidationResults.failed) {
      return (
        <div>
          Validation failed for the following reasons:
        </div>
      );
    }

    return null;
  }

  getButtons() {
    const { validationStatus, filesToUpload } = this.state;

    if (filesToUpload.length === 0) {
      return null;
    }

    let onClick = null;
    let loading = false;
    let title = 'Validate Readings'
    let disabled = false;
    let color = 'red';

    if (validationStatus === FileUploadValidationResults.notStarted
      || validationStatus === FileUploadValidationResults.failed) {
      title = "Validate Readings";
      disabled = false;
      onClick = () => this.uploadAndValidate();
    }

    if (validationStatus === FileUploadValidationResults.pending) {
      disabled = true;
      loading = true;
    }


    if (validationStatus === FileUploadValidationResults.success) {
      title = 'Process Readings';
      onClick = () => this.process();
    }


    return (
      <SimpleButton
        onClick={onClick}
        loading={loading}
        title={title}
        disabled={disabled}
        color={color}
      />
    );
  }

  render() {
    if (this.state.loading) {
      return <Loading />
    }

    return (
      <div>
        {this.getFileDrop()}
        {this.getPendingFiles()}
        {this.getSettingsForm()}
        {this.getValidationDialog()}
        {this.getButtons()}

      </div>
    );
  }

}

export default UploadReadingPage;