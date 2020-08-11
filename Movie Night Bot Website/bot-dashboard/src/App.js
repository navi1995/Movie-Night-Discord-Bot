import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Homepage } from './pages/Homepage'
import { Menu } from './pages/Menu';
import { Dashboard } from './pages/Dashboard';
import './App.scss';
import { NavbarComponent } from './components/navbar';
import axios from 'axios';

function App() {
	const [user, setUser] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		getUserDetails().then(function(response) {
			console.log(response.data);
			setUser(response.data);
			setLoading(false);
		}).catch(function(err) {
			if (err.response && err.response.data.message) {
				setUser(null);
				setLoading(false);
				console.log("UNAUTH IN APP");
			}
		});
	}, []);

	return (
		<div>
		<NavbarComponent user={user} loading={loading} />
		<Switch>
			<Route path="/" exact={true} component={Homepage} />
			<Route path="/menu" exact={true} component={Menu} />
			<Route path="/dashboard/:id" exact={true} component={Dashboard} />
		</Switch>
		</div>
	);
}

function getUserDetails() {
	return axios.get('http://localhost:3001/api/auth', {
		withCredentials: true
	});
}


export default App;
