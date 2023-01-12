import { useFormik } from 'formik';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
// import fetch from 'node-fetch';

export default function RegisterForm() {
  const formik = useFormik({
    initialValues: {
      id: uuidv4(),
      username: '',
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('http://localhost:3000/register', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Użytkownik zarejestrowany', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      formik.resetForm({
        values: { id: uuidv4(), password: '', email: '', username: '' },
      });
    },
  });

  return (
    <div id="register" className="register-form">
      <button>
        <Link to="/">zaloguj się</Link>
      </button>
      <form className="register-form-contents" onSubmit={formik.handleSubmit}>
        <input
          value={formik.values.username}
          name="username"
          placeholder="login"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <input
          value={formik.values.email}
          name="email"
          placeholder="email"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <input
          value={formik.values.password}
          name="password"
          placeholder="hasło"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button className="register-submit-button" type="submit">
          zarejestruj
        </button>
      </form>
    </div>
  );
}
