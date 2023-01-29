import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import mqtt from "precompiled-mqtt"
import {useState} from 'react'
import { Link } from 'react-router-dom';


export default function Chat() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [chat, setChat] = useState([]);

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  const name = getCookie('name');

  useEffect(()=>{
    const client=mqtt.connect('ws://localhost:8083/mqtt')
    client.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to MQTT broker.");
    });
    if (isConnected) {
      client.subscribe("/chat/message");
      setIsSubscribed(true);
    }
    if (isSubscribed){
      client.on("message", (topic, message) => {
        setChat((prev)=>[...prev, message.toString()]);
      });
    }
    setClient(client)
    return ()=>{
      client.end();
      setClient(null)
    }
  }, [isConnected, isSubscribed])

  const handleBack = () => {
    client.end();
    setClient(null)
  }


  const formik = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: (values) => {
      client.publish(`/chat/message`, `${name}: ${values.message}`);
      formik.resetForm({
        values: { message: '' },
      });
    },
  });


  return (
    <div className="messages-form">
      <Link to="/MainPage">
        <button className="messages-back-button" onClick={()=>handleBack()}>powrót</button>
      </Link>
      <form className="messages-form-contents" onSubmit={formik.handleSubmit}>
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
        {chat.map((message, index) => (
          <div className="chat-message" key={index}>{message}</div>
        ))}
      </form>
    </div>
  );
}
