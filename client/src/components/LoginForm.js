import { useFormik } from 'formik';
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies} from 'react-cookie';


export default function LoginForm() {
  const [cookies, setCookie] = useCookies('id');
  const navigate = useNavigate()

  const handleCookie = (id) => {
    let time = new Date();
    time.setMinutes(time.getMinutes() + 30);
    setCookie('id', id, { path: '/' });
  };

  const handleCookieName = (name) => {
    let time = new Date();
    time.setMinutes(time.getMinutes() + 30);
    setCookie('name', name, { path: '/' });
  };


  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: (values) => {
      fetch('http://localhost:5000/login', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
      })
      .then((res) =>{
        if(res.status === 200){ 
            res.json().then(data=>{
              console.log(data)
              if(data._id) {
                handleCookie(data._id);
                handleCookieName(data.username);
                const id = data._id;
                alert('Zalogowano');
                navigate('/MainPage');
              } else {
                  throw new Error("id not found in server response")
              }
            })
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
