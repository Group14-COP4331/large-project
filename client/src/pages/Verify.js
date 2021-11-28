import React, { useState } from 'react';
import Image from '../bg2.jpg';
import './Forgot.css';
import { Paper, Typography, withStyles,  Button, Box, Link } from '@material-ui/core';

const styles = {
    paperContainer: {
        backgroundPosition: '-10px -10px',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${Image})`,
        textAlign: 'center',
    },
    font: {
        fontFamily: '"Sancreek", Open Sans',
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
    text:
    {
        width: '55%',
        textAlign: 'left',
        margin: 'auto',
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

  
const Verify = () => {
    
    var res = JSON.parse(localStorage.getItem('user_data'));

    if(!res)
        window.location.href = '/';

    if(res && res.verify === true)
        window.location.href = '/Game';

    var email = res.email;
    var username = res.username;

    const [verify, setVerify] = useState(0)

    const [message, setMessage] = useState('')

    const emailer = async event =>{

        var obj = { email: email};
        var js = JSON.stringify(obj);

        try {
            await fetch(buildPath('api/sendEmail'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
            setMessage('Email sent.');
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
                var user = {username: res.username, email: res.email, verify: true}
                localStorage.setItem('user_data', JSON.stringify(user));
                window.location.href = '/Game';
            }
            else if(resp.error === '1')
                setMessage('Invalid code.');

        }
        catch (e) {
            console.log(e.toString());
            return;
        }
    };

    return (
        <Paper style={styles.paperContainer}>
            <Box pt={10}>
                <WhiteTextTypography  style={styles.font} variant="h1" align="center">
                    VERIFY YOUR EMAIL
                </WhiteTextTypography>
            </Box>
            
            <Box pt={10}>
                <WhiteTextTypography variant="p" textAlign="center" style={styles.font} >
                <div style={styles.text}>
                    We sent an email to {email} to verify your email address and activate your account.
                    <Link onClick={emailer}> Click here </Link>
                    if you did not receive an email.
                </div>
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

export default Verify;