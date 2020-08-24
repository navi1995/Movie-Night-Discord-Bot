import React from 'react';
import { NavDropdown, Button, Container, Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { NavLink } from 'react-router-dom';

export function NavbarComponent(props) {
	const login = function() {
		window.location.href ='http://localhost:3001/api/auth/discord';
	}
	// const [user, setUser] = React.useState(props.user || null);
	const user = props.user || null;
	const loading = props.loading || false;
	const guilds = props.guilds  || [];
	const split = window.location.pathname.split("/");
	const dashboardID = window.location.pathname.indexOf("dashboard") > 0 ? split[split.length-1] : null;
	const currentGuild = guilds.find(guild => guild.id == dashboardID) || {};

	// guilds = guilds.sort(function(a, b) { return (b.isBotInServer - a.isBotInServer) });

	function isUserLoggedIn() {
		return user != null && user != undefined;
	}

	function isActive() {
		return window.location.pathname.indexOf("dashboard") > 0 || window.location.pathname == "/menu"
	}

	return (
		<Navbar style={{ backgroundColor: "rgb(44, 41, 41)" }} variant="dark" expand="lg">
			<Container>
				<Navbar.Brand>
					<img
						src="/images/logo.png"
						width="70"
						height="70"
						className="d-inline-block align-top"
					/>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="justify-content-end ml-auto">
						<Nav.Link exact as={NavLink} to={{pathname: `/`, state: {user: user}}}>Home</Nav.Link>
						{/* <Nav.Link >Commands</Nav.Link>
						<Nav.Link >Contact</Nav.Link> */}
						{isUserLoggedIn() && (<Nav.Link isActive={isActive} as={NavLink} to={{pathname: `/menu`, state: {user: user}}}>Menu</Nav.Link>)}
						{isUserLoggedIn() && currentGuild.id && (
							<NavDropdown title={<div className="dropdown-avatar"><img className="rounded-circle" src={currentGuild.icon ? `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}?size=256` : "/images/default.png"} />{currentGuild.name || ""}</div>}>
								{guilds.map(guild => (
									<NavDropdown.Item key={guild.id}><img className="rounded-circle" src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256` : "/images/default.png"} />{guild.name}</NavDropdown.Item>
								))}
							</NavDropdown>
						)}
						{isUserLoggedIn() && (
							<NavDropdown title={<div className="dropdown-avatar"><img className="rounded-circle" src={`https://cdn.discordapp.com/avatars/${user.discordID}/${user.avatar}?size=256`} /><span>{user.discordTag}</span></div>}>
								<NavDropdown.Item>Settings</NavDropdown.Item>
								<NavDropdown.Divider />
								<NavDropdown.Item href="http://localhost:3001/logout">Logoff</NavDropdown.Item>
							</NavDropdown>
						)}
						{!isUserLoggedIn() && !loading && (<Button onClick={login} variant="outline-primary">
								LOGIN WITH <FontAwesomeIcon icon={faDiscord} />
							</Button>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

// function getUserDetails() {
// 	return axios.get('http://localhost:3001/api/auth', {
// 		withCredentials: true
// 	});
// }