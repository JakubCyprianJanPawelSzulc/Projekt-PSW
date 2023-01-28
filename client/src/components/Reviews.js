import ReviewForm from "./ReviewsForm.js";
import ReviewsList from "./ReviewsList.js";
import { Link } from "react-router-dom";

export default function Reviews() {

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
            <button onClick={()=>deleteAll()}>
                usun wszystkie
            </button>
            <h2>Podziel się swoją opinią o stronie</h2>
            <ReviewForm />
            <ReviewsList />
        </div>
    );
}
