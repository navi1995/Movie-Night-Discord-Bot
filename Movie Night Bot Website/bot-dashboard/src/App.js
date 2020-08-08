import React from 'react';
import { Image, CardGroup, Card, Button, Row, Col, Container, Jumbotron, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faListOl, faRandom,  faCog, faCheckSquare, faPaintBrush, faBullhorn, faEye, faTrophy, faBrush } from '@fortawesome/free-solid-svg-icons'
import { faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { faImdb, faDiscord } from '@fortawesome/free-brands-svg-icons';
import './App.scss';

function App() {
	return (
		<div>
			<Navbar style={{ backgroundColor: "rgb(44, 41, 41)" }} variant="dark">
				<Container>
					<Navbar.Brand>
						<img
							src="/images/logo.png"
							width="70"
							height="70"
							className="d-inline-block align-top"
						/>
					</Navbar.Brand>
					<Nav activeKey="link-1" className="justify-content-end ml-auto">
						<Nav.Item>
							<Nav.Link eventKey="link-1">Home</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="link-2">Commands</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Nav.Link eventKey="link-3">Contact</Nav.Link>
						</Nav.Item>
						<Nav.Item>
							<Button variant="outline-primary">
								LOGIN WITH <FontAwesomeIcon icon={faDiscord} />
							</Button>
						</Nav.Item>
					</Nav>
				</Container>
			</Navbar>
			<Jumbotron style={{ backgroundColor: "rgb(44, 41, 41)", color: "white", marginBottom: "-30px", paddingBottom: "100px" }} className="text-center">
				<h1 className="display-1">
					Movie Night Bot <br />
						For Discord
					</h1>
				<Button variant="primary" size="lg">
					ADD TO DISCORD <FontAwesomeIcon icon={faDiscord} />
				</Button>
			</Jumbotron>
			<Container>
				<CardGroup className="text-center Box-Shadow">
					<Card>
						<div style={{ width: "100%", paddingTop: "1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
							<FontAwesomeIcon icon={faListOl} size="4x" />
						</div>
						<Card.Body>
							<Card.Title>Maintain Lists Of Movies</Card.Title>
							<Card.Text>Allows users in your discord to submit movies to a server maintained list.</Card.Text>
						</Card.Body>
					</Card>
					<Card>
						<div style={{ width: "100%", paddingTop: "1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
							<FontAwesomeIcon icon={faThumbsUp} size="4x" />
						</div>
						<Card.Body>
							<Card.Title>Poll Voting System</Card.Title>
							<Card.Text>Users vote on polls through reactions, additional votes are automatically removed by the bot.</Card.Text>
						</Card.Body>
					</Card>
					<Card>
						<div style={{ width: "100%", paddingTop: "1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
							<FontAwesomeIcon icon={faRandom} size="4x" />
						</div>
						<Card.Body>
							<Card.Title>Roulette Command</Card.Title>
							<Card.Text>Selects a random movie from the servers list if you can't decide on what to watch!</Card.Text>
						</Card.Body>
					</Card>
					<Card>
						<div style={{ width: "100%", paddingTop: "1.25rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
							<FontAwesomeIcon icon={faCog} size="4x" />
						</div>
						<Card.Body>
							<Card.Title>Custom Settings</Card.Title>
							<Card.Text>Numerous settings that admins can set to customse the bot to any servers needs!</Card.Text>
						</Card.Body>
					</Card>
				</CardGroup>
				<Row className="mt-5 info-panel">
					<Col><Image fluid className="image-shadow" src="/images/cropped-confirmation.png" /></Col>
					<Col>
						<h1>Add Command</h1>
						<p className="header-sub">Will search online databases and display all the movies details to you!</p>
						<Row>
							<Col>
								<FontAwesomeIcon icon={faCheckSquare} size="3x" color="#03a9f4" />
								<h5>Confirmation Prompt</h5>
								<p>Will ask user to confirm if the movie we found is what they intend to search for.</p>
							</Col>
							<Col>
								<FontAwesomeIcon icon={faImdb} size="3x" color="#03a9f4" />
								<h5>IMDB Links Supported!</h5>
								<p>Use IMDB links to be specific when adding a movie.</p>
							</Col>
						</Row>
						<Row>
							<Col>
								<FontAwesomeIcon icon={faList} size="3x" color="#03a9f4" />
								<h5>Details Stored</h5>
								<p>Will ask user to confirm if the movie we found is what they intend to search for.</p>
							</Col>
							<Col>
								<FontAwesomeIcon icon={faBrush} size="3x" color="#03a9f4" />
								<h5>Movie Poster</h5>
								<p>Use IMDB links to be specific when adding a movie.</p>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row className="mt-5 info-panel">
					<Col>
						<h1>Get/List Command</h1>
						<p className="header-sub">Gets a list of all the movies currently in the servers list. Viewed command can also be used to see all the movies that have been viewed before.!</p>
					</Col>
					<Col><Image fluid className="image-shadow" src="/images/cropped-list.png" /></Col>
				</Row>
				<Row className="mt-5 info-panel">
					<Col><Image fluid className="image-shadow" src="/images/cropped-poll.png" /></Col>
					<Col>
						<h1>Poll Command</h1>
						<p className="header-sub">Begins a poll in the server with up to a max of 10 random movies from the servers list. This can also be set to less movies if required.</p>
						<Row>
							<Col>
								<FontAwesomeIcon icon={faBullhorn} size="3x" color="#03a9f4" />
								<h5>Custom Announcements</h5>
								<p>Set custom announcement for when polls begin, even mention a specific role!</p>
							</Col>
							<Col>
								<FontAwesomeIcon icon={faThumbsUp} size="3x" color="#03a9f4" />
								<h5>ONE VOTE PER PERSON</h5>
								<p>The bot will automatically remove any previous votes if a user attempts to vote twice. One per person!</p>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row className="mt-5 info-panel">
					<Col>
						<h1>Winner</h1>
						<p className="header-sub">Winner of the film is announced after the poll ends.</p>
						<Row>
							<Col>
								<FontAwesomeIcon icon={faEye} size="3x" color="#03a9f4" />
								<h5>Auto-View Setting</h5>
								<p>Admins are able to set whether movies are automatically moved to the "Viewed" list after a successful poll or roulette.</p>
							</Col>
							<Col>
								<FontAwesomeIcon icon={faTrophy} size="3x" color="#03a9f4" />
								<h5>Winner Announced</h5>
								<p>Set custom time poll should be available, after this a winning film will be announced</p>
							</Col>
						</Row>
					</Col>
					<Col><Image fluid className="image-shadow" src="/images/cropped-win.png" /></Col>
				</Row>
			</Container>
		</div>
	);
}

export default App;
