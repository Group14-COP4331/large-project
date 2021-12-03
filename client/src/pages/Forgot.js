import React, { useState } from 'react';
import {Paper, withStyles, Typography, Box, Button} from '@material-ui/core';
import Image from '../bg2.jpg';
import './Forgot.css';
import './login.css';
import TextField from './TextField.js';
import Verify from './Verify';

const styles = {
    paperContainer: {
        backgroundPosition: '-10px -10px',
        height: '100vh',
        width: '100vw',
        // width: 1400,
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
    return 'https://dungeonride.herokuapp.com/' + route
}

function complexity(password)
{
    var ret = '';
    var req = [true, true, true, true];


    if(!req[0])
        ret += 'Password must be of at least length 8' + <br/>
    if(!req[1])
        ret += 'Password must contain at least one number' + <br/>
    if(!req[2])
        ret += 'Password must contain at least one special character' + <br/>
    if(!req[3])
        ret += "Password must contain at least capital character" + <br/>
    
    return ret;
}

const Forgot = () => {
    
    const [state, setState] = useState('email')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [message, setMessage] = useState('')
    const [verify, setVerify] = useState(0)
    const [password, setPassword] = useState('')
    const [verPassword, setVerPassword] = useState('')
    

    const emailer = async event =>{

        
        var obj = { email: email};
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

        var obj = { username: username, verifyCode: parseInt(verify)};
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

        if(password === "" || verPassword === "")
            setMessage('All fields required.');
        else if(password !==  verPassword)
            setMessage('Password fields must match.');
        else if(complexity(password) !== '')
            setMessage(complexity(password));
        else
        {
            event.preventDefault();

            var obj = { username: username, newPass: password};
            var js = JSON.stringify(obj);

            try {
                await fetch(buildPath('api/changePassword'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

                var user = {username: username, email: email, verify: true}
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
            <Box pt={10}>
            <WhiteTextTypography  align="center" style={styles.leftAlignEmail}> 
                ENTER GMAIL:
            </WhiteTextTypography>
            <input style={styles.inputText} onChange={event => setEmail(event.target.value)} /> {/* for the input text*/}
            </Box>
            <Box pt={3}>
            <Button class="raise" onClick={emailer}>Enter</Button>
            </Box>
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
                <Box pt={5}>
                <WhiteTextTypography  align="center" style={styles.leftAlignNew}> 
                    NEW PASSWORD:
                </WhiteTextTypography>
                <input type="password" style={styles.inputText} onChange={event => setPassword(event.target.value)} /> {/* for the input text*/}
                </Box>
                <WhiteTextTypography align="center" style={styles.leftAlignVerify} > 
                    VERIFY PASSWORD:
                </WhiteTextTypography>
                <input type="password" style={styles.inputText} onChange={event => setVerPassword(event.target.value)} /> {/* for the input text*/}
                <div style={styles.alignitems}>
                    <Box pt={3}>
                    <Button style={styles.buttons} class="raise" variant="contained" onClick={changePassword}> CHANGE PASSWORD</Button>
                    </Box>
                </div>
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
            <Box pt={5}>
            <WhiteTextTypography align="center" style={styles.leftAlign}> 
                CODE:
            </WhiteTextTypography>
            <input type="number"  style={styles.inputText} onChange={event => setVerify(event.target.value)} />
            </Box>
            <div style={styles.alignitems}>
                <Box pt={3}>
                <Button class="raise" onClick={doVerification}>SUBMIT</Button>
                </Box>
            </div>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
        )
    }
}


export default Forgot;