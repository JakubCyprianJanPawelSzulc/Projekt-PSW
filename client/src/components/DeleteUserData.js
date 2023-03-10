import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';



export default function DeleteUserData() {
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);

    function getCookie(id){
        var value = "; " + document.cookie;
        var parts = value.split("; " + id + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    const id = getCookie('id');

    useEffect(() => {
        if(id){
            const fetchData = async () => {
                try {
                    const result = await axios.get(`http://localhost:5000/api/user/${id}`);
                    setUser(result.data);
                } catch (error) {
                    setError(error);
                }
            };
            fetchData();
        }
    }, [id]);

    const handleDelete = async () => {
        try {
            const result = await axios.delete(`http://localhost:5000/api/user/${id}`);
            console.log(result);
        } catch (error) {
            setError(error);
        }
    };


    return(
        <button>
            <Link to="/" onClick={handleDelete}>usuń konto</Link>
        </button>
    )

}