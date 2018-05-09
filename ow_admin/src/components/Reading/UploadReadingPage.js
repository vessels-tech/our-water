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
      syncId: null,
      validateRetries: [10000, 20000, 40000, 80000, 160000],
      syncRetries: [10000, 20000, 40000, 80000, 160000],
      validationMessages:[],
      errorMessages: [],
      successMessages: [],
    };
  }

  /* Event Handlers */

  handleFileDrop(files) {
    //TODO: allow only one file at a time
    const { filesToUpload } = this.state;

    files.forEach(file => filesToUpload.push(file));
    this.setState({
      filesToUpload
    });
  }

  uploadAndValidate() {
    const { filesToUpload, validateRetries } = this.state;

    this.setState({
      validationStatus: FileUploadValidationResults.uploadingFiles,
    });

    return Promise.all(
      filesToUpload.map(file => {
        return FirebaseApi.uploadFile({orgId, file})
      })
    )
    .then(uploadedPaths => {
      const fileUrl = uploadedPaths[0];
      //Just for testing now
      // const fileUrl = 'https://firebasestorage.googleapis.com/v0/b/our-water.appspot.com/o/YccAYRrMjdwa0VFuwjVi%2FfileSync%2Ff9abc637-5fe3-4598-8db1-446b8c7b269d?alt=media&token=aad829b0-4836-479a-9f64-273b98a44782';
      return FirebaseApi.createFileUploadSync({ orgId, fileUrl });
    })
    .then(result => {
      console.log("sync", result);
      const syncId = result.syncId;
      this.setState({
        syncId,
        validationStatus: FileUploadValidationResults.validatingFiles,
      });

      return FirebaseApi.runFileUploadSync({orgId, syncId, validateOnly: true});
    })
    .then(result => FirebaseApi.pollForSyncRunStatus({
       orgId, 
       syncRunId: result.syncRunId, 
       retries: validateRetries 
    }))
    .then(syncRun => {
      console.log("finshed polling syncRun", syncRun);
      this.setState({
        validationStatus: FileUploadValidationResults.validationSuccess,
        successMessages: syncRun.results,
        validationMessages: syncRun.warnings,
        errors: syncRun.errors
      });
    })
    .catch(syncRun => {
      console.log('error uploading files', syncRun);

      this.setState({
        validationStatus: FileUploadValidationResults.failed,
        successMessages: syncRun.results,
        validationMessages: syncRun.warnings,
        errors: syncRun.errors
      });
    });
  }

  process() {
    const { syncId, syncRetries } = this.state;
    
    this.setState({
      validationStatus: FileUploadValidationResults.uploadingFiles,
    });

    return FirebaseApi.runFileUploadSync({ orgId, syncId, validateOnly: false })
    .then(result => {
      this.setState({
        validationStatus: FileUploadValidationResults.processingSync,
      });

      return FirebaseApi.pollForSyncRunStatus({ orgId, syncRunId: result.syncRunId, retries: syncRetries})
    })
    .then(syncRun => {
      console.log("finshed polling syncRun", syncRun); 
      this.setState({
        validationStatus: FileUploadValidationResults.success,
      });
    })
    .catch(syncRun => {
      console.log("sync run failed or timed out", syncRun);

      let validationStatus = FileUploadValidationResults.failed;
      if (syncRun.status === 'running') {
        validationStatus = FileUploadValidationResults.timedOut;
      }

      this.setState({
        validationStatus,
      });
    });
  }

  /* Render Extensions */

  getStatusMessage() {
    const { validationStatus } = this.state;

    if (validationStatus === FileUploadValidationResults.notStarted) {
      return null;
    }

    let statusText = "";
    let statusTextColor = 'black'

    switch (validationStatus) {
      case FileUploadValidationResults.uploadingFiles:
        statusText = 'Uploading Files.';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.validatingFiles:
        statusText = 'Validating Files';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.processingSync:
        statusText = 'Processing Sync';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.validationSuccess:
        statusText = 'Validation was successful.';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.failed:
        statusText = 'Validation or Sync Failed.';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.success:
        statusText = 'Sync success!';
        statusTextColor = 'black';
      break;
      case FileUploadValidationResults.timedOut:
        statusText = 'Sync timed out.';
        statusTextColor = 'black';
      break;
      default:
        statusText = "Unknown status.";
    }

    return (
      <div>
        <h3>{statusText}</h3>
      </div>
    )
  }

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

  getValidationMessages() {
    const { validationStatus, validationMessages, errorMessages } = this.state;

    if (validationMessages.length > 0) {
      return (
        <div>
          Validation Messages:
          <ul>
            {validationMessages.map(message => <li key={message}>{message}</li>)}
          </ul>
        </div>
      );
    }

    return null;
  }

  getErrorMessages() {
    const { errorMessages } = this.state;

    if (errorMessages.length === 0) {
      return null;
    }

    return (
      <div>
        Error Messages:
          <ul>
          {errorMessages.map(message => <li key={message}>{message}</li>)}
        </ul>
      </div>
    );
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

    if (validationStatus === FileUploadValidationResults.uploadingFiles 
      || validationStatus === FileUploadValidationResults.validatingFiles
      || validationStatus === FileUploadValidationResults.processingSync) {
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
        {this.getStatusMessage()}
        {this.getFileDrop()}
        {this.getPendingFiles()}
        {this.getSettingsForm()}
        {this.getValidationMessages()}
        {this.getErrorMessages()}
        {this.getButtons()}

      </div>
    );
  }

}

export default UploadReadingPage;