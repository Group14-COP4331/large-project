import React, { useState } from 'react';
import Image from '../bg2.jpg';
import { Paper, Typography, withStyles, Box, Button } from '@material-ui/core';
let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

function validateEmail (emailAdress)
{
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAdress.match(regexEmail)) {
    return true; 
  } else {
    return false; 
  }
}

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
    const [message, setMessage] = useState('')

    var email;
    var username;
    var password;
    var verifyPassword;

    const doSignup = async event => {
        
        event.preventDefault();

        var emailTemp = email.value;
        var usernameTemp = username.value;
        var passwordTemp = password.value;
        var verifyPasswordTemp = verifyPassword.value;


        if(emailTemp !== "" && validateEmail (emailTemp))
        {
            var obj = { email: emailTemp};
            var js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('api/userExists'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                var res = JSON.parse(await response.text());

                if(res.exists === 1)
                {
                    setMessage('Account with this email already exists.');
                    return;
                }
            }
            catch (e) {
                console.log(e.toString());
                return;
            }
        }

        if(emailTemp === "" || usernameTemp === "" || passwordTemp === "" || verifyPasswordTemp === "")
            setMessage('All fields required.');
        else if(!validateEmail (emailTemp))
            setMessage('Invalid email.');
        else if(passwordTemp !==  verifyPasswordTemp)
            setMessage('Password fields must match.');
        else if(!strongPassword.test(passwordTemp))
            setMessage('Password not strong enough.');
        else
        {
            setMessage('');

            obj = { username: usernameTemp};
            js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('api/userExists'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                var respo = JSON.parse(await response.text());

                if(respo.exists === 1)
                {
                    setMessage('Username already exists.');
                    return;
                }
            }
            catch (e) {
                console.log(e.toString());
                return;
            }

            obj = { username: usernameTemp, email: emailTemp, password: passwordTemp};
            js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('api/registerUser'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                
                res = JSON.parse(await response.text());

                var user = {username: usernameTemp, id: res.id, email: emailTemp, verify: false}
                localStorage.removeItem('user_data');
                localStorage.setItem('user_data', JSON.stringify(user));
                

                obj = { email: emailTemp};
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
            <form onSubmit={doSignup}>
                <Box pt={10}>
                <WhiteTextTypography  align="center" style={styles.leftAlignEmail}> 
                    EMAIL:
                </WhiteTextTypography>
                <input style={styles.inputText} type="text" ref={(c) => email = c} />
                </Box>

                <WhiteTextTypography  align="center" style={styles.leftAlignPassword}> 
                    USERNAME:
                </WhiteTextTypography>
                <input style={styles.inputText} type="text" ref={(c) => username = c} />

                <WhiteTextTypography align="center" style={styles.leftAlignPassword} > 
                    PASSWORD:
                </WhiteTextTypography>
                <input type="password" style={styles.inputText} ref={(c) => password = c} />

                <WhiteTextTypography align="center" style={styles.leftAlignVerify} > 
                    VERIFY PASSWORD:
                </WhiteTextTypography>
                <input type="password" style={styles.inputText} ref={(c) => verifyPassword = c} />
                
                <div style={styles.alignitems}>
                    <Box pt={3}>
                    <Button type="submit" id="signupButton" class="raise" value="SIGNUP" onClick={doSignup} style={styles.buttons}>CREATE ACCOUNT</Button>
                    </Box>
                </div>
            </form>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
    )
}


export default SignUp;