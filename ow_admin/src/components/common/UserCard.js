import React, {Component} from 'react'
import PropTypes from 'prop-types';

class UserCard extends Component {

  render() {
    const { firstName, lastName, email, phone } = this.props;

    return (
      <article className="mw5 center bg-white br3 pa3 pa4-ns mv3 ba b--black-10">
        <div className="tc">
          <img src="http://tachyons.io/img/avatar_1.jpg"
               className="br-100 h4 w4 dib ba b--black-05 pa2"
               title="Photo of a kitty staring at you"/>
          <h1 className="f3 mb2">{firstName} {lastName}</h1>
          <h2 className="f5 fw4 gray mt0">{phone}</h2>
          <h2 className="f5 fw4 gray mt0">{email}</h2>
          <h2 className="f5 fw4 gray mt0">CCO (Chief Cat Officer)</h2>
        </div>
      </article>
    );
  }


}

UserCard.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string
};

export default UserCard;
