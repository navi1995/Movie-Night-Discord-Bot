import React from "react";
import { Container, Row } from "react-bootstrap";
import { FooterComponent } from "../../components/footer";
import { Command } from "../../components/command";

export function Commands(props) {
	return (
		<div className="commands-page">
			<div style={{ backgroundColor: "rgb(44, 41, 41)", color: "white", paddingBottom: "100px" }} className="jumbotron text-center">
				<h1 className="display-1">
					Movie Night Bot <br />
					For Discord
				</h1>
				<br />
				<h3 style={{ color: "white" }}>Commands</h3>
				<br />
			</div>
			<Container>
				<h3>The bot now uses slash commands. Type / and see what's available!</h3>
				<h6>Please note!! The bot will NOT stream movies to the discord server. I recommend one person streaming, or using Plex ;)</h6>
				<br></br>
				<Row xs={1} md={1}>
					<Command title="add">
						Search for a movie, if more than one result found the bot will ask for confirmation. It is then added to the UNVIEWED list for the server.
						<br /> <br />
						Check 'add-movies-role' command for permission-based usage.
					</Command>
					<Command title="get">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>movie </td>
									<td>Will search for a movie, first in your servers unviewed and viewed lists. If nothing is found there, it will try search the global database and show you the movie details WITHOUT adding it.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>random </td>
									<td>Gets a random movie from your unviewed list. Used to be known as roulette.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>viewed-list </td>
									<td>Gets a list of all the servers viewed movies</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>unviewed-list </td>
									<td>Gets a list of all the servers unviewed movies</td>
								</tr>
							</tbody>
						</table>
					</Command>
					<Command title="poll">
						Begins a poll using up to a MAXIMUM of 10 random movies from the UNVIEWED list. Once the poll is complete, the winner will be announced.
						<br></br>
						Options:
						<br />
						<br />
						Size: Number of movies that will be included in the poll. Max is 10.<br></br>
						Message: Sets the message that will be sent when the poll begins.<br></br>
						Time: How long in MINUTES the poll will last. Default is 60, no limit.<br></br>
						Multiple Votes: Disalow will enforce one vote per member, allow multiple will do as it says.
						<br /> <br />
						If Auto-View is set to on, the movie will be moved to the VIEWED list.
						<br /> <br />
						Check 'start-poll-role' command for permission-based usage. By default this is an administrator only command.
					</Command>
					<Command title="remove">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>movie </td>
									<td>Will remove the movie from server lists. By default only administrators or the user that submitted the movie is able to utilise this command.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>viewed-list </td>
									<td>Will remove all the movies from the viewed list in the server. Admin only.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>unviewed-list </td>
									<td>Will remove all the movies from the uviewed list in the server. Admin only.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Check 'delete-role' command for permission-based usage.
					</Command>
					<Command title="set">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>viewed </td>
									<td>Sets the searched movie to viewed. Movie must be in the server lists.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>unviewed </td>
									<td>Sets the searched movie to unviewed. Movie must be in the server lists.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Check 'view-role' command for permission-based usage.
					</Command>
					<Command title="countdown">Counts down from a specified number so everyone can click 'Play' at the same time.</Command>
					<Command title="autoview">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td>
									<td>Shows the current setting for the server.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>on </td>
									<td>Sets movies automatically to 'viewed' after a successful poll.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>off </td>
									<td>Will not automatically set to 'viewed' after a successful poll.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Default is off. (This Command is Administrator only).
					</Command>
					<Command title="start-poll-role">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td>
									<td>Shows the current setting for the server.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>set-role </td>
									<td>Sets a specific role who will now be able to start polls.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td>
									<td>The default. Will only allow admins to start polls.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td>
									<td>Allows anyone in the server to start polls.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Default is Admin only. (This command is Administrator only).
					</Command>
					<Command title="delete-role">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td>
									<td>Shows the current setting for the server.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>set-role </td>
									<td>Sets a specific role who will now be able delete movies.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td>
									<td>The default. Will only allow admins to delete movies.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td>
									<td>Allows anyone in the server to delete movies.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Default is Admin only. (This command is Administrator only).
					</Command>
					<Command title="view-role">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td>
									<td>Shows the current setting for the server.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>set-role </td>
									<td>Sets a specific role who will now be able set movies to viewed.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>admin-only </td>
									<td>The default. Will only allow admins to set movies to viewed.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td>
									<td>Allows anyone in the server to set movies to viewed.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Default is Admin only. (This command is Administrator only).
					</Command>
					<Command title="add-movies-role">
						<table>
							<tbody>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>show-setting </td>
									<td>Shows the current setting for the server.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>set-role </td>
									<td>Sets a specific role who will now be able add movies.</td>
								</tr>
								<tr>
									<td style={{ width: "200px", verticalAlign: "top" }}>allow-all </td>
									<td>Allows anyone in the server to add movies.</td>
								</tr>
							</tbody>
						</table>
						<br />
						Default is allow all. (This command is Administrator only).
					</Command>
					<Command title="stats">Shows current number of servers the bot is present in and the number of users its serving.</Command>
				</Row>
			</Container>
			<FooterComponent />
		</div>
	);
}
