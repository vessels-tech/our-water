import React, { Component } from 'react'
import PropTypes from 'prop-types';

import Loading from './Loading';


class SimpleButton extends Component {
  render() {
    const {onClick, loading, title, disabled, color} = this.props;

    //TODO: add loading, disabled state
    return (
      <button
        disabled={disabled}
        className="f6 mr3 link dim br1 ba ph3 pv2 mb2 dib mid-gray bg-washed-red"
        onClick={() => onClick()}
      >
        {loading ? <Loading type={'small'}/> : title}
      </button>
    );
  }
}

SimpleButton.propTypes = {
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  title: PropTypes.string,
  disabled: PropTypes.bool,
  color: PropTypes.string,
};

export default SimpleButton;