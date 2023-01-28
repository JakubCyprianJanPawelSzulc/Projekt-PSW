import React, { useEffect } from 'react';
import EditReviewForm from './EditReviewForm.js';


export default function Review(props) {
    const [admin, setAdmin] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);

    function getCookie(id){
        var value = "; " + document.cookie;
        var parts = value.split("; " + id + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    const id = getCookie('id');

    useEffect(() => {
        if (id == '63d52f11a349b4697bb1b6f6'){
            setAdmin(true);
        }
    }, []);
    

    function handleEditClick() {
        setIsEditing(true);
    }
    function handleStopEditClick() {
        setIsEditing(false);
    }

    function handleDeleteClick() {
        fetch(`http://localhost:5000/api/review/${props.review._id}`, {
        method: 'DELETE',
        });
    }

    return (
        <div className="review">
        <p className="review-user">{props.review.user}</p>
        <p className="review-contents">{props.review.contents}</p>
        {admin && (
            <div className="comment-admin-panel">
            <button onClick={handleDeleteClick}>Usuń opinię</button>
            {isEditing ? (
                <div>
                <button onClick={handleStopEditClick}>Skończ edytować</button>
                <EditReviewForm
                    review={props.review}
                    setIsEditing={setIsEditing}
                />
                </div>
            ) : (
                <button onClick={handleEditClick}>Edytuj opinię</button>
            )}
            </div>
        )}
        </div>
    );
}
