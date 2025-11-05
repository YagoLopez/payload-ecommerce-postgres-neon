import React from 'react'

const styles = {
  background: 'aliceblue',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'navy',
  borderRadius: '5px',
  padding: '10px',
  marginTop: '10px',
  marginBottom: '10px',
  boxShadow: '0 10px 8px rgba(0, 0, 0, 0.1)',
}

export const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Welcome to the Ecommerce Admin Dashboard.</b> This is where site admins will log in to manage the
        store.
      </p>
      <div style={styles}>
        <p style={{color: 'navy', fontWeight: 'bold'}}>You can login as a guest using the following credentials:</p>
        <p>➡️ <b>Email:</b> readonly@readonly.com</p>
        <p>➡️ <b>Password:</b> readonly</p>
      </div>

      <p>
        Customers will need to
        <a href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/login`}> log in to the site instead </a>
        to access their user account, order history, and more.<br/>
      </p>
    </div>
  )
}
