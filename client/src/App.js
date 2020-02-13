import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

//Import components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

const App = () => (
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path='/' component={Landing} />

      {/* Div with a class of container to push pages in the center, instead of displaying from top of the screen like landing page.  */}
      <section className='container'>
        <Route path='/register' component={Register} />
        <Route path='/login' component={Login} />
      </section>
    </Fragment>
  </Router>
);

export default App;
