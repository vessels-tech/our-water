import React, {Component} from 'react'
import PropTypes from 'prop-types';


class SelectButton extends Component {

  getButtons() {
    return this.props.buttonConfig.map(buttonConfig => {
      return (
        <button
          key={buttonConfig.name}
          onClick={buttonConfig.callback}
        >
          {buttonConfig.name}
        </button>);
    })
  }

  render() {
    return (
      <div>
        {this.getButtons()}
      </div>
    );
  }
}

SelectButton.propTypes = {
  buttonConfig: PropTypes.arrayOf(PropTypes.shape({
    callback: PropTypes.func,
    name: PropTypes.string
  })),
  selectedIndex: PropTypes.number,
};

export default SelectButton;
