import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { gql, graphql } from 'react-apollo'
import PropTypes from 'prop-types';

import { Loading, UserCard } from './common'

class AccountPage extends Component {

  getLoginOrSignup() {
    return (
      <div>
        Login or signup.
      </div>
    )
  }

  render() {
    //TODO: load different things depending on if we're logged in or not...
    if (this.props.data.loading) {
      return <Loading/>
    }

    if (!this.props.data.allUsers) {
      return this.getLoginOrSignup();
    }

    const user = this.props.data.allUsers[0];

    return (
      <div>
        <UserCard firstName={user.firstName} lastName={user.lastName} email={user.email} phone={user.phone}/>
      </div>
    );
  }

}

AccountPage.propTypes = {
  phone: PropTypes.string
};

const UserQuery = gql`query allUsers($phone: String!) {
  allUsers(filter:{phone: $phone}) {
    id
    phone
    contactMethod
    firstName
    lastName
    email
  }
}`

const AccountPageWithUserQuery = graphql(UserQuery, {
  options: ({ match }) => ({variables: {phone: match.params.phone}}),
})(AccountPage);

export default AccountPageWithUserQuery;
