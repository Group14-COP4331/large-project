import React, { useState } from 'react';
import {Paper, withStyles, Typography, Box, Button} from '@material-ui/core';
import Image from '../bg2.jpg';
import './Forgot.css';
import './login.css';

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
    leftAlignNew: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-43px)'
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

const Forgot = () => {
    localStorage.clear();
    
    const [state, setState] = useState('email')
    var email;
    const [emailTemp, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')
    var verify;
    var password;
    var verPassword;

    const emailer = async event =>{

        event.preventDefault();

        setEmail(email.value);

        if(!validateEmail (email.value))
        {
            setMessage('Invalid email.');
            return;
        }
        
        var obj = { email: email.value};
        var js = JSON.stringify(obj);
        
        try {
            const response = await fetch(buildPath('api/userFromEmail'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());

            if(res.error === '1')
            {
                setMessage('Email not registered.');
                return;
            }
            else
                setUsername(res.username);

            await fetch(buildPath('api/sendEmail'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                
            setMessage('')
            setState('verify');
        }
        catch (e) {
            console.log(e.toString());
            return;
        }
    }

    const doVerification = async event => {
        event.preventDefault();

        var obj = { username: username, verifyCode: parseInt(verify.value)};
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/verifyCode'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            var resp = JSON.parse(await response.text());

            if(resp.error === '0')
            {
                setMessage('')
                setState('changepassword');
            }
            else if(resp.error === '1')
                setMessage('Invalid code.');

        }
        catch (e) {
            console.log(e.toString());
            return;
        }
    };

    const changePassword = async event => {

        var passwordTemp = password.value;
        var verPasswordTemp = verPassword.value;

        event.preventDefault();
        
        if(passwordTemp === "" || verPasswordTemp === "")
            setMessage('All fields required.');
        else if(passwordTemp !==  verPasswordTemp)
            setMessage('Password fields must match.');
        else if(!strongPassword.test(passwordTemp))
            setMessage('Password not strong enough.');
        else
        {
            setMessage('');
            var obj = { username: username, newPass: passwordTemp};
            var js = JSON.stringify(obj);
            
            try {
                await fetch(buildPath('api/changePassword'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                    

                obj = { email: emailTemp, password: passwordTemp};
                js = JSON.stringify(obj);

                const response = await fetch(buildPath('api/login'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

                var res = JSON.parse(await response.text());
                
                var user = {username: username, id: res.id, email: emailTemp, verify: true}
                localStorage.removeItem('user_data');
                localStorage.setItem('user_data', JSON.stringify(user));

                window.location.href = '/Verify';
            }
            catch (e) {
                console.log(e.toString());
                return;
            }
        }

    };

    if(state === 'email')
    {
        return(
            <Paper style={styles.paperContainer}>
                <Box pt={10}>
                <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                    FORGOT PASSWORD
                </WhiteTextTypography>
                </Box>
                <form onSubmit={emailer}>
                    <Box pt={10}>
                    <WhiteTextTypography  align="center" style={styles.leftAlignEmail}> 
                        ENTER GMAIL:
                    </WhiteTextTypography>
                    <input style={styles.inputText} type="text" ref={(c) => email = c} />
                    </Box>
                    <Box pt={3}>
                    <div style={styles.alignitems}>
                        <Button type="submit" class="raise" value="EMAIL" onClick={emailer}>Enter</Button>
                    </div>
                    </Box>
                </form>
                <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
            </Paper>
            )
    }
    else if(state === 'changepassword')
    {
        return(
            <Paper style={styles.paperContainer}>
                    <Box pt={10}>
                    <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                        FORGOT PASSWORD
                    </WhiteTextTypography>
                </Box>
                <form onSubmit={changePassword}>
                    <Box pt={5}>
                    <WhiteTextTypography  align="center" style={styles.leftAlignNew}> 
                        NEW PASSWORD:
                    </WhiteTextTypography>
                    <input style={styles.inputText} type="password" ref={(c) => password = c} />
                    </Box>
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
    else if(state === 'verify')
    {
        return(
            <Paper style={styles.paperContainer}>
            <Box pt={10}>
                <WhiteTextTypography  style={styles.font} variant="h1" align="center">
                    FORGOT PASSWORD
                </WhiteTextTypography>
            </Box>
            
            <Box pt={5}>
                <WhiteTextTypography variant="p" textAlign="center" style={styles.font} >
                </WhiteTextTypography>
            </Box>
            <form onSubmit={doVerification}>
                <Box pt={5}>
                <WhiteTextTypography align="center" style={styles.leftAlign}> 
                    CODE:
                </WhiteTextTypography>
                <input style={styles.inputText} type="number" ref={(c) => verify = c} />
                </Box>
                <div style={styles.alignitems}>
                    <Box pt={3}>
                    <Button type="submit" class="raise" value="VERIFY" onClick={doVerification}>SUBMIT</Button>
                    </Box>
                </div>
            </form>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
        )
    }
}


export default Forgot;