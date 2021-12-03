import React from 'react';
import {Paper, Typography, withStyles, Box, Button} from '@material-ui/core';
import './login.css';

import Image from '../bg2.jpg';

const styles = {
    paperContainer: {
        backgroundPosition: '-10px -10px',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${Image})`
    },
    font: {
      fontFamily: '"Sancreek", Open Sans',
    },
    alignitems: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
    },
    buttons: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      height: 75,
      width: 300,
      fontSize: 25,
      backgroundColor: '#ffffff',
      fontFamily: '"Sancreek", Open Sans',
      '&:hover': {
        backgroundColor: '#',
        color: '#3c52b2',
    },
  },
};

//for the text color to be white
const WhiteTextTypography = withStyles({
    root: {
      color: "#FFFFFF"
    }
  })(Typography);

const Home = () => {

    localStorage.clear();
    return(
        <Paper style={styles.paperContainer}>
          <Box pt={10}>
            <WhiteTextTypography  style={styles.font} variant="h1" align="center" > 
              Dungeon Run
            </WhiteTextTypography>
          </Box>
          <Box pt={10}>
            <div style={styles.alignitems}>
              <Button style={styles.buttons} class="raise" variant="contained" onClick={()=> window.location.href='/login'}> LOGIN </Button>
              <Box pt={2}></Box>
              <Button style={styles.buttons} class="raise" variant="contained" onClick= {()=> window.location.href='/Signup'}>SIGN UP</Button>
            </div>
          </Box>
        </Paper>
    )
}

export default Home;
