import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
// import {ApolloProvider, createNetworkInterface, ApolloClient} from 'react-apollo'
import 'tachyons'
import './index.css'

import { Nav } from './components/common'
// import GraphPage from './components/GraphPage'

import ResourcePage from './components/Resource/ResourcePage'
import EditResourcePage from './components/Resource/EditResourcePage'

// import ClientPage from './components/Client/ClientPage'
// import EditClientPage from './components/Client/EditClientPage'

// console.log(process.env.REACT_APP_GRAPHQL_ENDPOINT);

// const networkInterface = createNetworkInterface({
//   uri: process.env.REACT_APP_GRAPHQL_ENDPOINT
// })

// const client = new ApolloClient({networkInterface})

//TODO: load the current phone number from local storage, and pass into nav.
//Or just try and load the user here? And pass it through somehow...

ReactDOM.render(
  // <ApolloProvider client={client}>
    <Router>
      <div>
        <Nav/>
        {/* <Route exact path='/' component={ThreadPage} /> */}
        {/* <Route path='/graphs' component={GraphPage} /> */}
        <Switch>
          <Route exact path='/resource' component={ResourcePage}/>
          <Route path="/resource/edit/:resourceId" component={EditResourcePage}/>
        </Switch>
        {/* <Route path='/resource/edit' component={EditResourcePage} /> */}
        {/* <Route exact path='/client' component={ClientPage}/> */}
        {/* <Route path='/client/edit/:id' component={EditClientPage} /> */}
        {/* <Route path='/thread/:id' component={ThreadDetailPage} /> */}
        {/* <Route path='/user/:phone' component={AccountPage}/> */}
        
      </div>
    </Router>,
  // </ApolloProvider>,
  document.getElementById('cumulativeGraphs'),
)
