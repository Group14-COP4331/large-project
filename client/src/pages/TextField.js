import React from 'react';
import './Forgot.css';
//import { Box } from '@material-ui/core';

const styles = {
  howBig: {
    width: 200,
    height: 35,
  },
  buttons: {
    height: 75,
    width: 300,
    fontSize: 30,
    backgroundColor: '#ffffff',
    fontFamily: '"Sancreek", Open Sans',
    '&:hover': {
      backgroundColor: '#',
      color: '#3c52b2',
  },
  },
};

export default class Forgot extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.value);
      event.preventDefault();
    }
  
    render() {
      return (
          <form onSubmit={this.handleSubmit}>
              <input style={styles.howBig} type="text" className="center" value={this.state.value} onChange={this.handleChange} />
          </form>
      );
    }
  }