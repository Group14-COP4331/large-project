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
    innerdiv:
    {
        width: '70%',
        margin: 'auto',
        textAlign: 'left',

    },
    font: {
        fontFamily: '"Sancreek", Open Sans',
        color: '#ffffff',
    },
    leftAlign: {
        fontFamily: '"Sancreek", Open Sans',
        transform: 'translateX(-62px)'
    },
    leftAlign2: {
        fontFamily: '"Sancreek", Open Sans',
        fontSize: 'min(4vw, 2.33em)',
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
      account: {
        padding: 5,
        border: '3px solid #ffffff',
        borderRadius: '15px', 
        width: 'min(70%, 700px)',
        margin: 'auto'
      },
      buttons: {
        height: 40,
        padding:10,
        fontSize:20,
        width: '250px',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: '"Sancreek", Open Sans',
        '&:hover': {
          backgroundColor: '#',
          color: '#3c52b2',
      },
    },

    inputText: {
        fontSize: '1.5em',
        height: 40,
        width: '100%',
        display: "flex",
        alignItems: 'left',
    }
};

const WhiteTextTypography = withStyles({
    root: {
      color: "#FFFFFF"
    }
  })(Typography);


const Account = () => {

    var res = JSON.parse(localStorage.getItem('user_data'));
    
    if(!res)
        window.location.href = '/';

    const [st, setSt] = useState('')
    const [message, setMessage] = useState('')
    var username;


    const comfirmEdit = async event =>
    {
        event.preventDefault();
        
        var usernameTemp = username.value;

        var obj = { username: usernameTemp};
        var js = JSON.stringify(obj);

        const response = await fetch(buildPath('api/userExists'),
                    { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });
        var resp = JSON.parse(await response.text());

        if(resp.exists === 1 && res.username !== usernameTemp)
        {
            setMessage('Username already exists.');
            return;
        }
        else if(res.username === usernameTemp)
        {
            setSt('');
            setMessage('')
        }
        else
        {
            obj = { username: res.username, newUsername: usernameTemp};
            js = JSON.stringify(obj);

            await fetch(buildPath('api/changeUser'),
                { method: 'POST', body: js, headers: { 'Content-Type': 'application/json' } });

            var user = {username: usernameTemp, id: res.id, email: res.email, verify: res.verify}
            localStorage.removeItem('user_data');
            localStorage.setItem('user_data', JSON.stringify(user));
            setSt('');
            setMessage('')
        }

    }

    const cancelEdit = async event =>
    {
        setSt('');
        setMessage('');
    }

    if(st === "")
    {
        return(
                <Paper style={styles.paperContainer}>
                    <Box pt={10}>
                        <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                            ACCOUNT
                        </WhiteTextTypography>
                    </Box>
                    <br/><br/>
                    <div style={styles.account}>
                        <a href="/verify" style={{color: 'white' ,textDecoration: 'none', fontFamily:'"Sancreek", Open Sans'}}> ~BACK</a>
                        <div style={styles.innerdiv}>
                        <Box pt={2.2}>
                        <WhiteTextTypography variant="h4" style={styles.leftAlign2}> 
                            {res.email}
                        </WhiteTextTypography>
                        </Box>
                        <Box pt={5}>
                        <WhiteTextTypography variant="h4" style={styles.leftAlign2}> 
                            {res.username}
                        </WhiteTextTypography>
                        </Box>
                        </div>
                        <div style={styles.alignitems}>
                        <Box pt={5}>
                                <Button  class="raise" style={styles.buttons} onClick={(e) => setSt('edit')} >EDIT USERNAME</Button>
                            </Box>
                            <br/>
                            <WhiteTextTypography className="forgotPSize" align="center" style={styles.font}>
                                <a href="/Changepassword" style={{color: 'white' ,textDecoration: 'none'}}>CHANGE PASSWORD</a>
                            </WhiteTextTypography>
                            <br/><br/>
                        </div>
                    </div>
                    <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
                </Paper>
        )
    }
    else if(st === "edit")
    {
        return(
            <Paper style={styles.paperContainer}>
                <Box pt={10}>
                    <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                        ACCOUNT
                    </WhiteTextTypography>
                </Box>
                <br/><br/>
                <form onSubmit={comfirmEdit}>
                <div style={styles.account}>

                    <div style={styles.innerdiv}>
                    <Box pt={5}>
                        <WhiteTextTypography variant="h4" style={styles.leftAlign2}> 
                            {res.email}
                        </WhiteTextTypography>
                        </Box>
                    <Box pt={5}>
                        <input defaultValue={res.username} style={styles.inputText} type="text" ref={(c) => username = c}/>
                    </Box>
                    </div>
                    <div style={styles.alignitems}>
                        <Box pt={5}>
                            <Button  type="submit" class="raise" value="CONFIRM" style={styles.buttons} onClick={comfirmEdit} >CONFIRM EDIT</Button>
                        </Box>
                        <Box pt={3}>
                            <Button  class="raise" style={styles.buttons} onClick={(e) => cancelEdit()} >CANCEL EDIT</Button>
                        </Box>
                        <br/><br/>
                    </div>
                </div>
                </form>
                <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
            </Paper>
        )
    }

    /*return(
        <Paper style={styles.paperContainer}>
            <Box pt={10}>
                <WhiteTextTypography style={styles.font} variant="h1" align="center" > 
                    ACCOUNT
                </WhiteTextTypography>
            </Box>
            <br/><br/>
            <div style={styles.account}>
                <div style={styles.innerdiv}>
                <Box pt={5}>
                <WhiteTextTypography variant="h5" style={styles.leftAlign2}> 
                    {res.username}
                </WhiteTextTypography>
                </Box>
                <Box pt={5}>
                <WhiteTextTypography variant="h5" style={styles.leftAlign2}> 
                    {res.email}
                </WhiteTextTypography>
                </Box>
                </div>
                <div>
                    <Box pt={5}>
                        <Button  class="raise" style={styles.buttons}>EDIT</Button>
                    </Box>
                    <br/><br/>
                </div>
            </div>
            <h4 style={{textAlign:"center", color:'white'}}>{message}</h4>
        </Paper>
)*/

}


export default Account;
