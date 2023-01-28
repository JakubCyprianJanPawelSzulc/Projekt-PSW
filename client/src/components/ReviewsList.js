import React from 'react';
import Review from './Review.js';
import { useEffect } from 'react';

export default function ReviewsList() {

    const [reviewsList, setReviewsList] = React.useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/review')
            .then((response) => response.json())
            .then((data) => {
                setReviewsList(data);
            });
    }, []);


  
    return (
        <div className="reviews-list">
        {reviewsList.map((el) => (
            <Review key={el._id} id={el._id} review={el} />
        ))}
        </div>
    );
}
