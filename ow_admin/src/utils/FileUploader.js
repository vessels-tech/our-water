import 'whatwg-fetch'

const uploadFiles = (files) => {
  let data = new FormData()
  data.append('data', files[0]);

  // use the file endpoint
  return fetch(process.env.REACT_APP_FILE_ENDPOINT, {
    method: 'POST',
    body: data
  }).then(response => {
    return response.json();
  });
}

module.exports = {
  uploadFiles: uploadFiles
}
