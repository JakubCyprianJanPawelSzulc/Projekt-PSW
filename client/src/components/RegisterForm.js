import { useFormik } from 'formik';
import React from 'react';
import { Link } from 'react-router-dom';
// import fetch from 'node-fetch';

export default function RegisterForm() {
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('http://localhost:5000/register', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => res.json())
        .then((data) => {
          if(data.message==='User added successfully') {
            alert('Zarejestrowano');
          } else if (data.message==='Username already exists') {
            alert('Ta nazwa użytkownika jest już zajęta');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      formik.resetForm({
        values: { password: '', email: '', username: '' },
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
