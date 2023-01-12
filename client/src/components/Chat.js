import { useFormik } from 'formik';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Messages from './Messages.js';

export default function LoginForm() {
  const formik = useFormik({
    initialValues: {
      id: uuidv4(),
      user: '',
      message: '',
    },
    onSubmit: (values) => {
      formik.resetForm({
        values: { message: '' },
      });
    },
  });

  return (
    <div className="messages-form">
      <form className="messages-form-contents" onSubmit={formik.handleSubmit}>
        <Messages />
        <input
          value={formik.values.message}
          name="message"
          placeholder="wiadomość"
          onChange={formik.handleChange}
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <button className="messages-submit-button" type="submit">
          wyślij
        </button>
      </form>
    </div>
  );
}
