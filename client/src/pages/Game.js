import React from 'react';
import ScriptTag from 'react-script-tag';

const Game = () => {

    var res = JSON.parse(localStorage.getItem('user_data'));

    
    if(!res)
        window.location.href = '/';
    


    return (
        <div>
            <ScriptTag type = "text/javascript" src="main_game.js" />
        </div>
    )
}

export default Game;