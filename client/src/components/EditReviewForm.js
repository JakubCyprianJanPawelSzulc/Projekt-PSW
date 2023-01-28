import { useFormik } from 'formik';
import React from 'react';

export default function EditReviewForm({ review }) {
  const initialValues = {
    id: review._id,
    contents: review.contents,
    user: review.user,
  };
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      fetch(`http://localhost:5000/api/review/${values.id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' },
        });
        formik.resetForm({
            values: { id: review._id, contents: '', user: review.user },
        });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
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
      <button className="submit-button" type="submit">
        akceptuj
      </button>
    </form>
  );
}
