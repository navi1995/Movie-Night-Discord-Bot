import React from "react";
import { NavDropdown, Button, Container, Navbar, Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

export function NavbarComponent(props) {
	const login = function () {
		window.location.href = `${process.env.REACT_APP_API_FULLURL}auth/discord`;
	};
	// const [user, setUser] = React.useState(props.user || null);
	const user = props.user || null;
	const loading = props.loading || false;
	let guilds = props.guilds || [];
	const split = window.location.pathname.split("/");
	const dashboardID = window.location.pathname.indexOf("dashboard") > 0 ? split[split.length - 1] : null;
	const currentGuild = guilds.find((guild) => guild.id === dashboardID) || {};

	guilds = guilds.sort(function (a, b) {
		return b.isBotInServer - a.isBotInServer;
	});

	function isUserLoggedIn() {
		return user != null && user !== undefined;
	}

	function isDashboardActive() {
		return window.location.pathname.indexOf("dashboard") > 0;
	}

	return (
		<Navbar variant="dark" expand="lg">
			<Container>
				<Navbar.Brand>
					<img src="/images/logo.png" width="70" height="70" className="d-inline-block align-top" alt="Movie Night Bot" />
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="justify-content">
						<Nav.Link end as={NavLink} to={{ pathname: `/` }}>
							Home
						</Nav.Link>
						<Nav.Link end as={NavLink} to={{ pathname: `/commands` }}>
							Commands
						</Nav.Link>
						{isUserLoggedIn() && (
							<Nav.Link as={NavLink} to={{ pathname: `/menu` }}>
								Menu
							</Nav.Link>
						)}
					</Nav>
					<Nav className="justify-content-end ml-auto">
						{isUserLoggedIn() && currentGuild.id && (
							<NavDropdown
								active={isDashboardActive()}
								title={
									<div className="dropdown-avatar">
										<img alt="" className="rounded-circle" src={currentGuild.icon ? `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}?size=256` : "/images/default.png"} />
										{currentGuild.name || ""}
									</div>
								}
							>
								{guilds.map((guild) =>
									guild.isBotInServer ? (
										<NavDropdown.Item as={NavLink} to={{ pathname: `/dashboard/${guild.id}` }} active={currentGuild.id === guild.id} key={guild.id}>
											<img alt="" className="rounded-circle" src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256` : "/images/default.png"} />
											<div class="guild-name">{guild.name}</div>
										</NavDropdown.Item>
									) : (
										<NavDropdown.Item
											target="_blank"
											rel="noopener noreferrer"
											href={`https://discord.com/oauth2/authorize?client_id=709271563110973451&permissions=1073835072&scope=bot&guild_id=${guild.id}`}
											active={currentGuild.id === guild.id}
											key={guild.id}
										>
											<img alt="" className="rounded-circle" src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}?size=256` : "/images/default.png"} />
											<div class="guild-name">{guild.name}</div>
											<div class="invite-icon">
												<FontAwesomeIcon style={{ marginTop: "6px" }} size="xs" pull="right" icon={faPlus} />
											</div>
										</NavDropdown.Item>
									)
								)}
							</NavDropdown>
						)}
						{isUserLoggedIn() && (
							<NavDropdown
								title={
									<div className="dropdown-avatar">
										<img alt="" className="rounded-circle" src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordID}/${user.avatar}?size=256` : "https://cdn.discordapp.com/embed/avatars/1.png"} />
										<span>{user.discordTag}</span>
									</div>
								}
							>
								<NavDropdown.Item href={`${process.env.REACT_APP_BASE_API_URL}logout`}>Logoff</NavDropdown.Item>
							</NavDropdown>
						)}
						{!isUserLoggedIn() && !loading && (
							<Button onClick={login} variant="outline-primary">
								LOGIN WITH <FontAwesomeIcon icon={faDiscord} />
							</Button>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
