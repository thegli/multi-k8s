import React from 'react';
import { Link } from 'react-router-dom';

export default() => {
  return (
    <div>
      This is the other side of the Universe!<br />
      <Link to="/">Beam me Home</Link>
    </div>
  );
};
