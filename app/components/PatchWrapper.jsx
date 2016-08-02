import React from 'react';

const PatchWrapper = ({ children }) => (
  <div className="PatchWrapper">
    {children}
  </div>
);

PatchWrapper.propTypes = {
  children: React.PropTypes.arrayOf(React.PropTypes.element),
};

export default PatchWrapper;