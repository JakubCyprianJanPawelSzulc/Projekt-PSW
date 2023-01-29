import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';

export default function EditUserData() {
  const [userData, setUserData] = useState({});
  const [error, setError] = useState(null);

  function getCookie(id){
    var value = "; " + document.cookie;
    var parts = value.split("; " + id + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  const id = getCookie('id');

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const result = await axios.get(`http://localhost:5000/api/user/${id}`);
          setUserData(result.data);
        } catch (error) {
          setError(error);
        }
      };
      fetchData();
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      username: userData.username || '',
      email: userData.email || '',
      password: '',
    },
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:5000/api/user/${id}`, values);
        console.log('Dane zostały zmienione');
      } catch (error) {
        setError(error);
      }
    },
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="edit-user-data">
      <form onSubmit={formik.handleSubmit}>
        <label>
          <input
            type="text"
            name="username"
            placeholder="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            required
          />
        </label>
        <label>
          <input
            type="text"
            name="email"
            placeholder="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            required
          />
        </label>
        <label>
          <input
            type="password"
            name="password"
            placeholder="password"
            onChange={formik.handleChange}
            required
          />
        </label>

        <button type="submit">Zmień dane</button>
      </form>
    </div>
  );
}
