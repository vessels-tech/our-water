import React, {Component} from 'react'
import PropTypes from 'prop-types';

class Loading extends Component {

  render() {
    if(this.props.type === 'small') {
      return (
        <div>
          Loading...
        </div>
      );
    }

    if(this.props.type === 'card') {
      return (
        <div
          className='blur bg-white ma3 post flex flex-column no-underline br2'
          style={{padding: 20}}
        >
          <h2>Asked by: XXXXX</h2>
          <div className='flex items-center black-80 fw3 question'>
            XXXXX
          </div>
          <h3>Tags:XXX</h3>
        </div>
      )
    };

    return (
      <div className='flex w-100 h-100 items-center justify-center pt7'>
        <div>
          Loading...
        </div>
      </div>
    )
  }
}

Loading.propTypes = {
  type: PropTypes.string
};


export default Loading
