import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
// import {ApolloProvider, createNetworkInterface, ApolloClient} from 'react-apollo'
import 'tachyons'
import './index.css'

import { Nav } from './components/common'

import ResourcePage from './components/Resource/ResourcePage'
import EditResourcePage from './components/Resource/EditResourcePage'
import ReadingPage from './components/Reading/ReadingPage';
import UploadReadingPage from './components/Reading/UploadReadingPage';

ReactDOM.render(
  // <ApolloProvider client={client}>
    <Router>
      <div>
        <Nav/>
        <Switch>
          <Route exact path='/resource' component={ResourcePage}/>
          <Route path="/resource/edit/:resourceId" component={EditResourcePage}/>
        </Switch>
        <Switch>
          <Route exact path='/reading' component={ReadingPage}/>
          <Route path="/reading/upload/" component={UploadReadingPage} />
        </Switch>
      </div>
    </Router>,
  // </ApolloProvider>,
  document.getElementById('cumulativeGraphs'),
)
