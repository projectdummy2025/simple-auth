import React from 'react';

const HomePage = ({ user }) => {
  return (
    <div>
      <h2>Welcome to the Protected Home Page</h2>
      {user ? (
        <div>
          <p>Hello, <strong>{user.username}</strong>!</p>
          <p>Your user ID is: {user.id}</p>
          <p>Your email is: {user.email}</p>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default HomePage;
