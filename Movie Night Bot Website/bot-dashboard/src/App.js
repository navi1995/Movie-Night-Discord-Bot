import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Homepage } from './pages/Homepage'
import { Menu } from './pages/Menu';
import { Dashboard } from './pages/Dashboard';
import './App.scss';
import { NavbarComponent } from './components/navbar';
import axios from 'axios';

function App() {
	const [user, setUser] = React.useState(null);
	const [guilds, setGuild] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const location = useLocation();

	//Run user check on every location change (If cookies removed, log user out as unauthorized)
	React.useEffect(() => {
		getUserDetails().then(function(response) {
			console.log('use effect');
			setUser(response.data);
			
			return getGuilds();			
		}).then(function(response) {
			setGuild(response.data);
			console.log(response.data);
			setLoading(false);
		}).catch(function(err) {
			if (err.response && err.response.data.message) {
				setUser(null);
				setLoading(false);
				console.log("UNAUTH IN APP");

				if (window.location.pathname != '/') {
					window.location.pathname = '/';
				}
			}
		});
	}, [location]);

	return (
		<div>
		<NavbarComponent user={user} guilds={guilds} loading={loading} />
		{!loading && (
		<Switch>
			<Route path="/" exact={true} component={Homepage} />
			<Route path="/menu" exact={true} render={(props) => <Menu {...props} user={user} guilds={guilds} />} />
			<Route path="/dashboard/:id" exact={true} render={(props) => <Dashboard {...props} user={user} />} />
		</Switch>)}
		</div>
	);
}

function getUserDetails() {
	return axios.get('http://localhost:3001/api/auth', {
		withCredentials: true
	});
}

function getGuilds() {
	return axios.get('http://localhost:3001/api/discord/guilds', {
		withCredentials: true
	});
}


export default App;
