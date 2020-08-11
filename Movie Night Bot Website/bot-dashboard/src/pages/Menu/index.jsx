import React from 'react';
import axios from 'axios';
import { Loader } from '../../components/loader';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Container } from 'react-bootstrap';

export function Menu(props) {
	const userTest = props.location.state ? props.location.state.user : null;
	const [user, setUser] = React.useState(userTest || []);
	const [guilds, setGuild] = React.useState([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		getUserDetails().then(function(response) {
			setUser(response.data);
		}).then(function() {
			return getGuilds();
		}).then(function(response) {
			console.log(response.data)
			setGuild(response.data);
			setLoading(false);
		}).catch(function(err) {
			setLoading(false);
			props.history.push('/');
		});
	}, []);

	return (
		<div>
			{/* <NavbarComponent user={user} /> */}
			<Loader loading={loading} />
			{!loading && (
			<Container>
				<Row>
				{
				guilds.map(guild => (
					<Link to={{pathname: `/dashboard/${guild.id}`, state: {user: user}}} key={guild.id} >
						<Card className="text-center">
							{ guild.icon 
								? <Card.Img variant="top" src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256`} />
								: <Card.Img variant="top" src="/images/default.png" />
							}
							<Card.Body>
								<Button variant="primary" size="lg">{guild.name}</Button>
							</Card.Body>
						</Card>
					</Link>
				))
				}
				</Row>
			</Container>
			)}
		</div>
	);
}

function getGuilds() {
	return axios.get('http://localhost:3001/api/discord/guilds', {
		withCredentials: true
	});
}

function getUserDetails() {
	return axios.get('http://localhost:3001/api/auth', {
		withCredentials: true
	});
}