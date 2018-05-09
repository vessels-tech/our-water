import React, {Component} from 'react'
import { Link } from 'react-router-dom';

class Nav extends Component {

  render() {
    //TODO: figure out how to reenable fixed scrolling at page top
    return (
      <nav className="bg-light-red flex justify-between bb b--white-10">
        <div className="link white-70 hover-white no-underline flex items-center pa3" href="">
          <Link className="link dim white dib mr3" to="/" title="Home">Home</Link>
          <Link className="link dim white dib mr3" to="/resource" title="Graphs">Resource</Link>
          <Link className="link dim white dib mr3" to="/reading" title="Readings">Readings</Link>
        </div>
        {/* <div className="flex-grow pa3 flex items-center">
          <a className="f6 dib white bg-animate hover-bg-white hover-black no-underline pv2 ph4 br-pill ba b--white-20" href="/user/+61410237238">Me</a>
        </div> */}
      </nav>
    )
  }
}

export default Nav
