import React, { useState } from 'react';
import {Paper, withStyles, Typography, Box, Button} from '@material-ui/core';
import Image from '../bg2.jpg';
import './Forgot.css';
import './login.css';

function buildPath(route)
{
    return 'https://dungeonrun.herokuapp.com/' + route
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
    leftAlign: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-62px)'
    },
    leftAlign2: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-80px)'
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
        height: 40,
        width: 100,
        fontSize: 20,
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


const Login = () => {

    localStorage.clear();
    
    /*const [loginName, setName] = useState('')
    const [loginPassword, setPassword] = useState('')*/
    const [message, setMessage] = useState('')

    var loginName;
    var loginPassword;

    const doLogin = async event => {

        var loginNameTemp = loginName.value;
        var loginPasswordTemp = loginPassword.value;
    

        event.preventDefault();

        var obj = { email: loginNameTemp, password: loginPasswordTemp};
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/login'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var res = JSON.parse(await response.text());
            if (res.id <= 0) {
                setMessage('User/Password combination incorrect');
            } 
            else {
                var user = {username: res.username, id: res.id, email: loginNameTemp, verify: res.verified}
                localStorage.removeItem('user_data');
                localStorage.setItem('user_data', JSON.stringify(user));

                if(res.verified === false)
                {
                    obj = {email: loginNameTemp};
                    js = JSON.stringify(obj);

                    try {
                        await fetch(buildPath('api/sendEmail'),
                            { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
                    }
                    catch (e) {
                        console.log(e.toString());
                        return;
                    }
                }
                    
                window.location.href = '/Verify';
            }
        }
        catch (e) {
            console.log(e.toString());
            return;
        }
    };


    return(
        <Paper  style={styles.paperContainer}>
                <Box pt={10}>
                <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                    WELCOME BACK
                </WhiteTextTypography>
            </Box>
            <form onSubmit={doLogin}>
                <Box pt={10}>
                <WhiteTextTypography align="center" style={styles.leftAlign2}> 
                    EMAIL:
                </WhiteTextTypography>
                <input style={styles.inputText} type="text" ref={(c) => loginName = c} />
                </Box>
                <WhiteTextTypography align="center" style={styles.leftAlign} > 
                    PASSWORD:
                </WhiteTextTypography>
                <input style={styles.inputText} type="password" id="loginPassword" ref={(c) => loginPassword = c} />
                
                <div/>
                <div style={styles.alignitems}>
                    <Box pt={3}>
                        <Button type="submit" class="raise" value="LOGIN" onClick={doLogin}>LOGIN</Button>
                    </Box>
                </div>
            </form>
            <Box pt={2}>
            <WhiteTextTypography className="forgotPSize" align="center" style={styles.font}>
                <a href="/Forgot" style={{color: 'white' ,textDecoration: 'none'}}>FORGOT PASSWORD?</a>
            </WhiteTextTypography>
            </Box>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
    )

}


export default Login;
