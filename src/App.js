import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import UserProfile from './components/UserProfile.jsx';
import LogIn from './components/LogIn.jsx';
import Summary from './components/Summary.jsx';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountBalance: 0.0,
      currentUser: {
        userName: '',
        memberSince: '07/01/1990',
        loggedIn: false
      },
      debits: [],
      credits: []
    };
  };
  
  //Fetches credit array from fetch api call and adds it to the state.
  fetchCredits = async () => {
    try {
      await fetch("https://moj-api.herokuapp.com/credits").then(res => {
        return res.json();
      }).then(creditsArray => {
        //Sorting is down after fetch call, sorted by date, from earliest
        //to latest
        creditsArray.sort((a, b) => {
            return Date.parse(a.date) - Date.parse(b.date);
        });
        this.setState({credits: creditsArray}, this.calculateBalance);
      });
    }
    catch(error) {
      console.log(error);
    }
  };

  //Fetches credit array from fetch api call and adds it to the state.
  fetchDebits = async () => {
    try {
      await fetch("https://moj-api.herokuapp.com/debits").then(res => {
        return res.json();
      }).then(debitsArray => {
        //Sorting is down after fetch call, sorted by date, from earliest
        //to latest
        debitsArray.sort((a, b) => {
          return Date.parse(a.date) - Date.parse(b.date);
        });
        this.setState({debits: debitsArray}, this.calculateBalance);
      });
    }
    catch(error) {
      console.log(error);
    }
  };

  //Helper function to calculate the account balance
  //Total Amount of Credits - Total Amount of Debits = Account Balance
  calculateBalance = () => {
    const creditsTotal = this.state.credits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
    const debitsTotal = this.state.debits.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.amount;
    }, 0);
    this.setState({
      //Both totals are converted to string objects then parsed back to a float
      //to ensure correct calculations when adding credits and debits
      accountBalance: parseFloat(Number(creditsTotal).toFixed(2) - Number(debitsTotal).toFixed(2)).toFixed(2)
    });
  }

  componentDidMount() {
    this.fetchCredits();
    this.fetchDebits();
  }
  
  //After a user logs on, account balance is calculated
  mockLogIn = (logInInfo) => {
    const newUser = {...this.state.currentUser};
    newUser.loggedIn = true;
    newUser.userName = logInInfo.userName;
    this.setState({currentUser: newUser});
    this.calculateBalance();
  }

  addCredit = (newCreditObj) => {
    let newCredit = [...this.state.credits];
    newCredit.push(newCreditObj);
    //calculateBalace is a call back for setState() to ensure
    //up to date calculation and not wait for the component
    //to re-render with updated state.
    this.setState({
      credits: newCredit,
    }, this.calculateBalance);
  }

  addDebit = (newDebitObj) => {
    let newDebit = [...this.state.debits];
    newDebit.push(newDebitObj);
    //calculateBalace is a call back for setState() to ensure
    //up to date calculation and not wait for the component
    //to re-render with updated state.
    this.setState({
      debits: newDebit
    }, this.calculateBalance);
  }

  render() {
    const HomeComponent = () => (
      <Home 
        accountBalance={this.state.accountBalance}
        credits={this.state.credits}
        debits={this.state.debits} 
        userName={this.state.currentUser.userName} 
        loggedIn={this.state.currentUser.loggedIn}/>);
    const UserProfileComponent = () => (
      <UserProfile 
        userName={this.state.currentUser.userName} 
        memberSince={this.state.currentUser.memberSince}/>);
    const LogInComponent = () => (
      <LogIn 
        user={this.state.currentUser} 
        mockLogIn={this.mockLogIn} />);
    const CreditsComponent = () => (
      <Summary
        sumType="Credits"
        accountBalance={this.state.accountBalance}
        userName={this.state.currentUser.userName} 
        summary={this.state.credits}
        add={this.addCredit}/>);
    const DebitsComponent = () => (
      <Summary
        sumType="Debits"
        accountBalance={this.state.accountBalance}
        userName={this.state.currentUser.userName} 
        summary={this.state.debits}
        add={this.addDebit}/>);
    
    //path's have hardcoded route's in order for GitHub Pages deployment to work properly
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/CSCI-39548-Summer2021-Assignment04/" render={HomeComponent}/>
            <Route exact path={"/CSCI-39548-Summer2021-Assignment04/user/" + this.state.currentUser.userName} render={UserProfileComponent}/>
            <Route exact path="/CSCI-39548-Summer2021-Assignment04/login" render={LogInComponent}/>
            <Route exact path={"/CSCI-39548-Summer2021-Assignment04/user/" + this.state.currentUser.userName + "/credits"} render={CreditsComponent}/>
            <Route exact path={"/CSCI-39548-Summer2021-Assignment04/user/" + this.state.currentUser.userName + "/debits"} render={DebitsComponent}/>
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App;
