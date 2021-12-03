import React, { useState } from 'react';
import Image from '../bg2.jpg';
import { Paper, Typography, withStyles, Box, Button } from '@material-ui/core';
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
    leftAlignEmail: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-79px)'
    },
    leftAlignPassword: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-60px)'
    },
    leftAlignVerify: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-35px)'
    },
    center: {
        justifyContent: 'center',
    },
    alignitems: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
      },
    buttons: {
        height: 60,
        width: 200,
        fontSize: 12,
        alignItems: 'center',
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
    return 'https://dungeonride.herokuapp.com/' + route
}


const SignUp = () =>{
    
    localStorage.clear();
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [verifyPassword, setVerify] = useState('')
    const [message, setMessage] = useState('')

    const doSignup = async event => {

        if(email === "" || username === "" || password === "" || verifyPassword === "")
            setMessage('All fields required.');
        else if(password !==  verifyPassword)
            setMessage('Password fields must match.');
        else if(!strongPassword.test(password))
            setMessage('Password not strong enough.');
        else
        {
            setMessage('');

            var obj = { username: username};
            var js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('api/userExists'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                var res = JSON.parse(await response.text());

                if(res.exists === 1)
                {
                    setMessage('Username already exists.');
                    return;
                }
            }
            catch (e) {
                console.log(e.toString());
                return;
            }

            event.preventDefault();

            obj = { username: username, email: email, password: password};
            js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('api/registerUser'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                
                res = JSON.parse(await response.text());

                var user = {username: username, email: email, verify: false}
                localStorage.removeItem('user_data');
                localStorage.setItem('user_data', JSON.stringify(user));
                

                obj = { email: email};
                js = JSON.stringify(obj);

                try {
                    await fetch(buildPath('api/sendEmail'),
                        { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                }
                catch (e) {
                    console.log(e.toString());
                    return;
                }
                

                window.location.href = '/Verify';
            }
            catch (e) {
                console.log(e.toString());
                return;
            }
        }
    };



    return (
        <Paper style={styles.paperContainer}>
            <Box pt={10}>
                <WhiteTextTypography style={styles.font} variant="h1" align="center">
                    JOIN DUNGEON RUN
                </WhiteTextTypography>
            </Box>
            <Box pt={10}>
            <WhiteTextTypography  align="center" style={styles.leftAlignEmail}> 
                EMAIL:
            </WhiteTextTypography>
            <input  style={styles.inputText}  onChange={event => setEmail(event.target.value)} />
            </Box>

            <WhiteTextTypography  align="center" style={styles.leftAlignPassword}> 
                USERNAME:
            </WhiteTextTypography>
            <input  style={styles.inputText}  onChange={event => setUsername(event.target.value)} />

            <WhiteTextTypography align="center" style={styles.leftAlignPassword} > 
                PASSWORD:
            </WhiteTextTypography>
            <input  style={styles.inputText} type="password" onChange={event => (setPassword(event.target.value))} />

            <WhiteTextTypography align="center" style={styles.leftAlignVerify} > 
                VERIFY PASSWORD:
            </WhiteTextTypography>
            <input  style={styles.inputText} type="password" onChange={event => (setVerify(event.target.value))} />
            <div style={styles.alignitems}>
                <Box pt={3}>
                <Button style={styles.buttons} onClick={doSignup} class="raise" >CREATE ACCOUNT</Button>
                </Box>
            </div>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
    )
}


export default SignUp;