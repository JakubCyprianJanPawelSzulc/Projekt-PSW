import { useFormik } from 'formik';
import React from 'react';

export default function ReviewForm() {

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  const name = getCookie('name');

  const formik = useFormik({
    initialValues: {
      user: name,
      contents: ''
    },
    onSubmit: (values) => {
      fetch('http://localhost:5000/api/review', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
      });
      
      formik.resetForm({
        values: { user: name, contents: ''},
      });
    },
  });

  return (
    <div className="rewievs-form">
      <form className="reviews-form-contents" onSubmit={formik.handleSubmit}>
        <textarea
          value={formik.values.contents}
          name="contents"
          placeholder="opinia"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button className="reviews-submit-button" type="submit">
          dodaj
        </button>
      </form>
    </div>
  );
}
