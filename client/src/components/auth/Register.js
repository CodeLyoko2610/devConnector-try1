import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
// const axios = require('axios');

const Register = () => {
  //Create state variable using useState Hook
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  //Destructuring formData
  let { name, email, password, password2 } = formData;

  //Set new state inside the onChange method
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Submit form data
  const onSubmit = async e => {
    e.preventDefault(); //prevent from default submitting

    if (password !== password2) {
      console.log('Passwords do not match. Please fix your password.');
    } else {
      console.log('SUCCESS');
      //   //Create a new user
      //   let newUser = {
      //     name,
      //     email,
      //     password,
      //     password2
      //   };
      //   try {
      //     //Config and body for axios
      //     const config = {
      //       headers: {
      //         'Content-Type': 'application/json'
      //       }
      //     };
      //     const body = JSON.stringify(newUser);
      //     const res = await axios.post('/api/users', body, config);
      //     console.log(res.data);
      //   } catch (error) {
      //     console.log(error);
      //     console.log(error.response.data);
      //   }
    }
  };

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            required
            value={name}
            onChange={e => onChange(e)}
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={e => onChange(e)}
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
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
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            minLength='6'
            value={password2}
            onChange={e => onChange(e)}
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Log In</Link>
      </p>
    </Fragment>
  );
};

export default Register;
