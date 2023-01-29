import React, {useEffect} from "react";

export default function OtherUserData({id, username, email, games_played, wins, losses}) {

    const [admin, setAdmin] = React.useState(false);

    function getCookie(id){
        var value = "; " + document.cookie;
        var parts = value.split("; " + id + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    const userId = getCookie('id');

    useEffect(() => {
        if (userId == '63d52f11a349b4697bb1b6f6'){
            setAdmin(true);
        }
    }, []);

    const handleDeleteClick = (otherUserId) => {
        fetch(`http://localhost:5000/api/user/${otherUserId}`, {
        method: 'DELETE',
        });
    }


    return (
        <div className="other-user-data">
            <div>nazwa: {username}</div>
            <div>email: {email}</div>
            <div>liczba rozegranych gier: {games_played}</div>
            <div>wygrane: {wins}</div>
            <div>przegrane: {losses}</div>
            {admin && (
                <div className="other-user-data-admin-panel">
                    <button onClick={() => handleDeleteClick(id)}>Usuń użytkownika</button>
                </div>
            )}
        </div>
    )
}