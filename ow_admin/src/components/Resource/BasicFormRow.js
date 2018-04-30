import React, { Component } from 'react'
import PropTypes from 'prop-types';


class BasicFormRow extends Component {

  render() {
    const { id, form } = this.props;

    console.log("form.$(id):", form.$(id));

    return (
      <div>
        <label htmlFor={form.$(id).id}>
          {form.$(id).label}
        </label>
        <input {...form.$(id).bind()} />
        <p>{form.$(id).error}</p>
      </div>
    );
  }
}

BasicFormRow.propTypes = {
  id: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired
};

export default BasicFormRow;
