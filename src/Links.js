import React, { Component } from 'react'
import Link from './Link'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const LINKS_QUERY = gql`
  query {
    links {
      id
      url
      description
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
    }
  }
`

class Links extends Component {
  _subscribeToNewLinks = subscribeToMore => {
    if (!this.subscribed) {
      this.subscribed = true
      subscribeToMore({
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          console.log(subscriptionData, prev)

          const newLink = subscriptionData.data.newLink;
          const exists = prev.links.find(({ id }) => id === newLink.id);
          if (exists) return prev;

          return Object.assign({}, prev, {
            links: [newLink, ...prev.links],
            __typename: prev.links.__typename
          })
        }
      })
    }
  }

  render() {
    return (
      <Query query={LINKS_QUERY}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Loading...</div>
          if (error) return <div>Error</div>
          this._subscribeToNewLinks(subscribeToMore)

          const linksToRender = data.links

          return (
            <div>
              <h3>Neat Links</h3>
              <div>
                {linksToRender.map(link => <Link key={link.id} link={link} />)}
              </div>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default Links
