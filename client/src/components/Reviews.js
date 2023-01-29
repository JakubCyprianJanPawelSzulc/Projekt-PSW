import ReviewForm from "./ReviewsForm.js";
import ReviewsList from "./ReviewsList.js";
import { Link } from "react-router-dom";
import React from "react";
import { useEffect } from "react";

export default function Reviews() {
    const [admin, setAdmin] = React.useState(false);

    function getCookie(id){
        var value = "; " + document.cookie;
        var parts = value.split("; " + id + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    const id = getCookie('id');

    useEffect(() => {
        if (id == '63d6d1493f376188ab277ed0'){
            setAdmin(true);
        }
    }, []);

    const deleteAll = () => {
        fetch('http://localhost:5000/api/review', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
    }


    return (
        <div className="reviews">
            <Link to="/MainPage">
                <button>
                    powrót
                </button>
            </Link>
            {admin &&<button onClick={()=>deleteAll()}>
                usun wszystkie
            </button>
            }
            
            <div className="review-form-and-list">
                <h2 className="your-opinion">Podziel się swoją opinią o stronie</h2>
                <ReviewForm />
                <ReviewsList />
            </div>
        </div>
    );
}
