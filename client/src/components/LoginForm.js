import { useFormik } from 'formik';
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies} from 'react-cookie';


// import fetch from 'node-fetch';

export default function LoginForm() {
  const [cookies, setCookie] = useCookies(['id']);
  const navigate = useNavigate()
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
      })
      .then((res) =>{
        if(res.status === 200){ 
            // console.log(res.headers.get('Set-Cookie'))
            // const cookies = res.headers.get('set-cookie');
            // const id = cookies.split(';').find(cookie => cookie.startsWith('id'));
            setCookie('id', res.id, {path:'/'});
            // setCookie('id', cookies.id, { path: '/' });
            alert('Zalogowano')
            navigate('/MainPage')
            return res.json()
        } else {
            alert('Wrong login or password')
        }
       })
        .catch((error) => {
          console.error('Error:', error);
        });
      formik.resetForm({
        values: { password: '', username: '' },
      });
    },
  });

  return (
    <div id="login" className="login-form">
      <form className="login-form-contents" onSubmit={formik.handleSubmit}>
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
          value={formik.values.password}
          name="password"
          placeholder="hasło"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button className="login-submit-button" type="submit">
          zaloguj
        </button>
      </form>
    </div>
  );
}
