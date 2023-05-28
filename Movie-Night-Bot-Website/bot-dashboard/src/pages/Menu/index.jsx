import React from 'react';
import { FooterComponent } from '../../components';
import { Link } from 'react-router-dom';
import { Card, Button, Row, Container, Col, ListGroup } from 'react-bootstrap';

export function Menu(props) {
	const [user] = React.useState(props.user || []);
	const [guilds] = React.useState(props.guilds || []);
	const [loading] = React.useState(props.loading);

	return (
		<div className='menu-page'>
			{!loading && (
			<Container>
				<Row>
				{
				guilds.filter(guild => {
					return guild.isBotInServer;
				}).map(guild => (
					<Col xl={3} lg={4} md={4} sm={6} xs={6} className='clearfix py-3' key={guild.id} >
						<Link to={{pathname: `/dashboard/${guild.id}`, state: {user: user}}} key={guild.id} >
							<Card className='text-center' bg='dark'>
								{ guild.icon 
									? <Card.Img variant='top' src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256`} />
									: <Card.Img variant='top' src='/images/default.png' />
								}
								<div className={'hover-toggle'}>
									<ListGroup variant='flush'>
										<ListGroup.Item>Auto-View: {guild.settings.autoViewed ? 'On' : 'Off'}</ListGroup.Item>
									</ListGroup>
								</div>
								<Card.Body>
									<Button variant='primary' size='lg'>{guild.isBotInServer ? guild.name : `Invite to ${guild.name}`}</Button>
								</Card.Body>
							</Card>
						</Link>
					</Col>
				))
				}
				</Row>
				<Row>
				{
				guilds.filter(guild => {
					return !guild.isBotInServer;
				}).map(guild => (
					<Col xl={3} lg={4} md={4} sm={6} xs={6} className='clearfix py-3' key={guild.id}>
					<a target='_blank' rel='noopener noreferrer' href={`https://discord.com/oauth2/authorize?client_id=709271563110973451&permissions=1073835072&scope=bot&guild_id=${guild.id}`}>
							<Card className='text-center' bg='dark'>
								{ guild.icon 
									? <Card.Img variant='top' src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256`} />
									: <Card.Img variant='top' src='/images/default.png' />
								}
								<Card.Body>
									<Button variant='primary' size='lg'>{guild.isBotInServer ? guild.name : `Invite to ${guild.name}`}</Button>
								</Card.Body>
							</Card>
						</a>
					</Col>
				))
				}
				</Row>
			</Container>
			)}
			{!loading && (<FooterComponent />)}
		</div>
	);
}