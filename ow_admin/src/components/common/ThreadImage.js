import React, {Component} from 'react'
import PropTypes from 'prop-types';

class ThreadImage extends Component {

  getImage() {
    if (!this.props.imageUrl) {
      return null;
    }

    const imageStyle = `url("${this.props.imageUrl}") center`;
    return (
        <div className="aspect-ratio aspect-ratio--16x9 mb4">
          <div className="aspect-ratio--object cover" style={{background: imageStyle}}></div>
        </div>
    );
  }

  render() {
    if (!this.props.imageUrl) {
      return null;
    }

    if (this.props.imageUrl.indexOf('http') === -1) {
      return null;
    }

    return this.getImage();
  }
}

ThreadImage.propTypes = {
  imageUrl: PropTypes.string
}

export default ThreadImage
