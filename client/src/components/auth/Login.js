import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  //Create state variable using useState Hook
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  //Destructuring formData
  let { email, password } = formData;

  //Set new state inside the onChange method
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Submit form data
  const onSubmit = async e => {
    e.preventDefault(); //prevent from default submitting
    console.log('Login succeeded.');
  };

  return (
    <Fragment>
      <h1 className='large text-primary'>Login</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Sign Into Your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={e => onChange(e)}
          />
        </div>

        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
            value={password}
            onChange={e => onChange(e)}
          />
        </div>

        <input type='submit' className='btn btn-primary' value='Login' />
      </form>
      <p className='my-1'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
};

export default Login;
