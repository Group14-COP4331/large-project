import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Forgot from './pages/Forgot';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';


const App = () => {
    return (
    <div>
        <Router>
            <Routes>
                <Route path="/" exact element={<Home />} />
                <Route path="/login" exact element={<Login />} />
                <Route path="/Forgot" exact element={<Forgot />} />
                <Route path="/Signup" exact element={<Signup />} />
                <Route path="/Verify" exact element={<Verify />} />
                <Route path="/Game" exact element={<Home />} />
            </Routes>
        </Router>
    </div>
      );
}

export default App;