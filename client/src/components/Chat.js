import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import mqtt from "precompiled-mqtt"
import {useState} from 'react'


export default function Chat() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [chat, setChat] = useState([])

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


  const formik = useFormik({
    initialValues: {
      id: uuidv4(),
      message: '',
    },
    onSubmit: (values) => {
      client.publish(`/chat/message`, values.message);
      formik.resetForm({
        values: { message: '' },
      });
    },
  });


  return (
    <div className="messages-form">
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
          <div key={index}>{message}</div>
        ))}
      </form>
    </div>
  );
}
