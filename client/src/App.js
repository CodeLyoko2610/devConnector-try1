import React, { Fragment } from 'react';
import './App.css';

//Import components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

const App = () => (
  <Fragment>
    <Navbar />
    <Landing />
  </Fragment>
);

export default App;
