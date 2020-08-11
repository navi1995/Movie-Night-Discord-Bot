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

	// React.useEffect(() => {
	// 	getUserDetails().then(function(response) {
	// 		console.log(response.data);
	// 		setUser(response.data);
	// 	}).catch(function(err) {
	// 		if (err.response && err.response.data.message) {
	// 			setUser(null);
	// 		}
	// 	});
	// }, []);

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
						{isUserLoggedIn() && (
							<NavDropdown title={<div className="dropdown-avatar"><img className="rounded-circle" src={`https://cdn.discordapp.com/avatars/${user.discordID}/${user.avatar}?size=256`} /><span>{user.discordTag}</span></div>}>
								<NavDropdown.Item>Settings</NavDropdown.Item>
								<NavDropdown.Divider />
								<NavDropdown.Item>Logoff</NavDropdown.Item>
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