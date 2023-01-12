import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import formik from 'formik';

export default function EditUserData() {

    const [cookies] = useCookies(['id']);
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);


    useEffect(() => {
        if(cookies.id){
            const fetchData = async () => {
                try {
                    const result = await axios.get(`http://localhost:3000/api/users/${cookies.id}`);
                    setUser(result.data);
                } catch (error) {
                    setError(error);
                }
            };
            fetchData();
        }
    }
    , [cookies.id]);


    const handleEdit = async () => {
        try {
            const result = await axios.put(`http://localhost:3000/api/users/${cookies.id}`);
            console
        } catch (error) {
            setError(error);
        }
    };

    return(
        <div className="edit-user-data">

            <form onSubmit={handleEdit}>
                <label>
                    <input type="text" name="username" placeholder="username" />
                </label>
                <label>
                    <input type="text" name="email" placeholder="email" />
                </label>
                <label>
                    <input type="text" name="password" placeholder="password" />
                </label>
                <label>
                    <input type="text" name="password2" placeholder="password2" />
                </label>
                
                <button type="submit">zmień dane</button>
            </form>
        </div>   
    )
}