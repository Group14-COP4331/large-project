import React, { useState } from 'react';
import {Paper, withStyles, Typography, Box, Button} from '@material-ui/core';
import Image from '../bg2.jpg';
import './Forgot.css';
import './login.css';

let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

const styles = {
    paperContainer: {
        backgroundPosition: '-10px -10px',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${Image})`,
    },
    font: {
        fontFamily: '"Sancreek", Open Sans',
    },
    leftAlignNew: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-43px)'
    },
    leftAlignNew1: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-46px)'
    },
    leftAlignVerify: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-35px)'
    },
    leftAlignEmail: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-55px)'
    },
    center: {
        justifyContent: 'center',
    },
    leftAlign: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-84px)'
    },
    alignitems: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
      },
    buttons: {
        fontSize: 12,
        width: 207,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: '"Sancreek", Open Sans',
        '&:hover': {
          backgroundColor: '#',
          color: '#3c52b2',
      },
    },
    inputText: {
        height: 40,
        width: 200,
        display: "flex",
        margin: 'auto',
        alignItems: 'center',
    }
};

const WhiteTextTypography = withStyles({
    root: {
      color: "#FFFFFF"
    }
  })(Typography);

function buildPath(route)
{
    return 'https://dungeonrun.herokuapp.com/' + route
}

const Changepassword = () => {

    var res = JSON.parse(localStorage.getItem('user_data'));

    if(!res)
        window.location.href = '/';

    
    const [message, setMessage] = useState('')
    var password;
    var oldPassword;
    var verPassword;


    const changePassword = async event => {

        setMessage('');
        event.preventDefault();

        var passwordTemp = password.value;
        var verPasswordTemp = verPassword.value;
        var oldPasswordTemp = oldPassword.value;

        
        if(passwordTemp === "" || verPasswordTemp === "" || oldPasswordTemp === "")
        {
            setMessage('All fields required.');
            return;
        }
        
        


        var obj = { email: res.email, password: oldPasswordTemp};
        var js = JSON.stringify(obj);

        
        try{
            const response = await fetch(buildPath('api/login'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });


            var resp = JSON.parse(await response.text());
            if (resp.id <= 0) {
                setMessage('Password incorrect.');
                return;
            } 
        }
        catch (e) {
            console.log(e.toString());
            return;
        }

        
        if(passwordTemp !==  verPasswordTemp)
        {
            setMessage('Password fields must match.');
            return;
        }
 
        if(!strongPassword.test(passwordTemp))
        {
            setMessage('Password not strong enough.');
            return;            
        }
        
    
        obj = { username: res.username , newPass: passwordTemp};
        js = JSON.stringify(obj);
        
        try {
            await fetch(buildPath('api/changePassword'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

        }
        catch (e) {
            console.log(e.toString());
            return;
        }
        
        window.location.href = '/Account';

    };

    return(
        <Paper style={styles.paperContainer}>
                <Box pt={10}>
                <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                    CHANGE PASSWORD
                </WhiteTextTypography>
            </Box>
            <form onSubmit={changePassword}>
                <Box pt={5}>
                <WhiteTextTypography  align="center" style={styles.leftAlignNew1}> 
                    OLD PASSWORD:
                </WhiteTextTypography>
                <input style={styles.inputText} type="password" ref={(c) => oldPassword = c} />
                </Box>
                <WhiteTextTypography  align="center" style={styles.leftAlignNew}> 
                    NEW PASSWORD:
                </WhiteTextTypography>
                <input style={styles.inputText} type="password" ref={(c) => password = c} />
                <WhiteTextTypography align="center" style={styles.leftAlignVerify} > 
                    VERIFY PASSWORD:
                </WhiteTextTypography>
                <input style={styles.inputText} type="password" ref={(c) => verPassword = c} />
                <div style={styles.alignitems}>
                    <Box pt={3}>
                    <Button type="submit" class="raise" value="PASSWORDCHANGE" style={styles.buttons} onClick={changePassword}> CHANGE PASSWORD</Button>
                    </Box>
                </div>
            </form>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
    )
}


export default Changepassword;