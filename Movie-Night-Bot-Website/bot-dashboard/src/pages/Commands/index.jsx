import React from 'react';
import { Container, Card, Row, Col, Jumbotron } from 'react-bootstrap';
import { FooterComponent } from '../../components/footer';

export function Commands(props) {
	return (
		<div className='commands-page'>
			<Jumbotron style={{ backgroundColor: 'rgb(44, 41, 41)', color: 'white', paddingBottom: '100px' }} className='text-center'>
				<h1 className='display-1'>
					Movie Night Bot <br />
					For Discord
				</h1>
				<br />
				<h3 style={{color: 'white'}}>
					Commands
				</h3>
				<br />
			</Jumbotron>
			<Container>
				<h3>The bot now uses slash commands. Type / and see what's available!</h3>
				<h6>Please note!! The bot will NOT stream movies to the discord server. I recommend one person streaming, or using Plex ;)</h6>
				<br></br>
				<Row xs={1} md={1}>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">add</Card.Header>
							<Card.Body>
								Search for a movie, if more than one result found the bot will ask for confirmation. It is then added to the UNVIEWED list for the server.
								<br /> <br />
								Check 'add-movies-role' command for permission-based usage.
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">get</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>movie </td><td>Will search for a movie, first in your servers unviewed and viewed lists. If nothing is found there, it will try search the global database and show you the movie details WITHOUT adding it.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>random </td><td>Gets a random movie from your unviewed list. Used to be known as roulette.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>viewed-list </td><td>Gets a list of all the servers viewed movies</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>unviewed-list </td><td>Gets a list of all the servers unviewed movies</td></tr>
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">poll</Card.Header>
							<Card.Body>
								Begins a poll using up to a MAXIMUM of 10 random movies from the UNVIEWED list. Once the poll is complete, the winner will be announced.
								<br></br>
								Options:<br /><br />
								Size: Number of movies that will be included in the poll. Max is 10.<br></br>
								Message: Sets the message that will be sent when the poll begins.<br></br>
								Time: How long in MINUTES the poll will last. Default is 60, no limit.<br></br>
								Multiple Votes: Disalow will enforce one vote per member, allow multiple will do as it says.
								<br /> <br />
								If Auto-View is set to on, the movie will be moved to the VIEWED list.
								<br /> <br />
								Check 'start-poll-role' command for permission-based usage. By default this is an administrator only command.
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">remove</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>movie </td><td>Will remove the movie from server lists. By default only administrators or the user that submitted the movie is able to utilise this command.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>viewed-list </td><td>Will remove all the movies from the viewed list in the server. Admin only.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>unviewed-list </td><td>Will remove all the movies from the uviewed list in the server. Admin only.</td></tr>
								<br />
								Check 'delete-role' command for permission-based usage.
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">set</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>viewed </td><td>Sets the searched movie to viewed. Movie must be in the server lists.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>unviewed </td><td>Sets the searched movie to unviewed. Movie must be in the server lists.</td></tr>
								<br />Check 'view-role' command for permission-based usage.
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">countdown</Card.Header>
							<Card.Body>
								Counts down from a specified number so everyone can click 'Play' at the same time.
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">autoview</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td><td>Shows the current setting for the server.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>on </td><td>Sets movies automatically to 'viewed' after a successful poll.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>off </td><td>Will not automatically set to 'viewed' after a successful poll.</td></tr>
								<br />Default is off. (This Command is Administrator only).
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">start-poll-role</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td><td>Shows the current setting for the server.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>set-role </td><td>Sets a specific role who will now be able to start polls.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td><td>The default. Will only allow admins to start polls.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td><td>Allows anyone in the server to start polls.</td></tr>
								<br/>Default is Admin only. (This command is Administrator only).
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">delete-role</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td><td>Shows the current setting for the server.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>set-role </td><td>Sets a specific role who will now be able delete movies.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td><td>The default. Will only allow admins to delete movies.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td><td>Allows anyone in the server to delete movies.</td></tr>
								<br/>Default is Admin only. (This command is Administrator only).
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">view-role</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td><td>Shows the current setting for the server.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>set-role </td><td>Sets a specific role who will now be able set movies to viewed.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td><td>The default. Will only allow admins to set movies to viewed.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td><td>Allows anyone in the server to set movies to viewed.</td></tr>
								<br/>Default is Admin only. (This command is Administrator only).
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">add-movies-role</Card.Header>
							<Card.Body>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td><td>Shows the current setting for the server.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>set-role </td><td>Sets a specific role who will now be able add movies.</td></tr>
								<tr><td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td><td>Allows anyone in the server to add movies.</td></tr>
								<br/>Default is allow all. (This command is Administrator only).
							</Card.Body>
						</Card>
					</Col>
					<Col style={{ paddingBottom: "20px"}}>
						<Card className="text-light">
							<Card.Header as="h5">stats</Card.Header>
							<Card.Body>
								Shows current number of servers the bot is present in and the number of users its serving.
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
			<FooterComponent />
		</div>
	);
}