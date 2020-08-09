import React from 'react';
import axios from 'axios';
import { Image, CardGroup, Card, Button, Row, Col, Container, Jumbotron, Navbar, Nav } from 'react-bootstrap';

export function Dashboard(props) {
	const [user, setUser] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		getUserDetails().then(function(response) {
			setUser(response.data);
			setLoading(false);
		}).catch(function(err) {
			props.history.push('/');
			setLoading(false);
		});
	}, []);

	return !loading && (
		<h1>Dashboard</h1>
	);
}

function getUserDetails() {
	return axios.get('http://localhost:3001/api/auth', {
		withCredentials: true
	});
}