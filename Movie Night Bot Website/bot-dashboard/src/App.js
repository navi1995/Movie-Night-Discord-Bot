import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Homepage } from './pages/Homepage'
import { Dashboard } from './pages/Dashboard';
import './App.scss';

function App() {
	return (
		<Switch>
			<Route path="/" exact={true} component={Homepage} />
			<Route path="/dashboard" exact={true} component={Dashboard} />
		</Switch>
	);
}

export default App;
