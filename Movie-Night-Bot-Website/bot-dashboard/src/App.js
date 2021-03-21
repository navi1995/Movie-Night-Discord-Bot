import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Homepage, Commands, Menu, Dashboard } from './pages';
import './App.scss';
import { NavbarComponent, Loader } from './components';
import { getUserDetails, getGuilds } from './utils/utils';

function App() {
	const [user, setUser] = React.useState(null);
	const [guilds, setGuild] = React.useState([]);
	const [loading, setLoading] = React.useState(true);
	const location = useLocation();

	//Run user check on every location change (If cookies removed, log user out as unauthorized)
	React.useEffect(() => {
		if (window.location.pathname == "/menu") {
			setLoading(true);
		}

		getUserDetails().then(function(response) {
			setUser(response.data);

			if (window.location.pathname == "/") {
				setLoading(false);
			}

			//Only do this if menu/dashboard url
			return getGuilds();			
		}).then(function(response) {
			setGuild(response.data);
			setLoading(false);
		}).catch(function(err) {
			if (err.response && err.response.data.message) {
				setUser(null);
				setLoading(false);
			}

			//Must add unauth page url's here for now.
			if (!(window.location.pathname == '/' || window.location.pathname == '/commands')) {
				window.location.pathname = '/';
			}

			if (window.location.pathname == '/' || window.location.pathname == '/commands') {
				setLoading(false);
				setUser(null);
			}
		});
	}, [location]);

	return (
		<div>
		<NavbarComponent user={user} guilds={guilds} loading={loading} />
		<Loader loading={loading} />
		{!loading && (
		<Switch>
			<Route path="/" exact={true} component={Homepage} />
			<Route path="/commands" component={Commands} exact={true} />
			<Route path="/menu" exact={true} render={(props) => <Menu {...props} user={user} guilds={guilds} loading={loading} />} />
			<Route path="/dashboard/:id" exact={true} render={(props) => <Dashboard {...props} user={user} guilds={guilds} />} />
		</Switch>)}
		</div>
	);
}


export default App;
