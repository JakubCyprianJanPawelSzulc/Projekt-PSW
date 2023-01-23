import React from "react";

export default function OtherUserData({username, email, games_played, wins, losses}) {
    return (
        <div className="other-user-data">
            <div>nazwa: {username}</div>
            <div>email: {email}</div>
            <div>liczba rozegranych gier: {games_played}</div>
            <div>wygrane: {wins}</div>
            <div>przegrane: {losses}</div>
        </div>
    )
}