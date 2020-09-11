import React from 'react';
import { Container, Jumbotron, Table } from 'react-bootstrap';
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
				<h3>The default prefix is --</h3>
				<h6>Login to dashboard and hover over guild to check prefix.</h6>
				<Table responsive variant="dark">
					<tbody>
						<tr>
							<td>help</td>
							<td>Will DM you with details on how to use each command the bot has to offer.</td>
						</tr>
						<tr>
							<td>add</td>
							<td>
								Search for a movie, if more than one result found the bot will ask for confirmation. It is then added to the UNVIEWED list for the server.
								<br /> <br />
								Check ‘moviesrole’ command for permission-based usage.
							</td>
						</tr>
						<tr>
							<td>remove</td>
							<td>
								Only administrators or the user that submitted the movie is able to utilise this command. This will search the UNVIEWED list and remove the movie.
								<br /> <br />
								If NO movie is specified, this will delete ALL UNVIEWED movies (Administrator only)
							</td>
						</tr>
						<tr>
							<td>get</td>
							<td>
								Searches the UNVIEWED list and return details of a movie if found.
								<br /> <br />
								If no movie is specified, it will return a list of ALL UNVIEWED movies.
							</td>
						</tr>
						<tr>
							<td>search</td>
							<td>Searches for a movie and returns results of the first one found and will NOT add the movie to the list. This command is to look at details for a movie.</td>
						</tr>
						<tr>
							<td>poll</td>
							<td>
								Begins a poll using up to a maximum of 10 random movies from the UNVIEWED list. Once the poll is complete, the winner will be announced.
								<br /> <br />
								If Auto-View is set to on, the movie will be moved to the VIEWED list.
								<br /> <br />
								(Administrator only, unless poll role has been set! Check Pollrole for more)
							</td>
						</tr>
						<tr>
							<td>random / roulette</td>
							<td>
								Selects a random movie from the UNVIEWED list.
								<br /> <br />
								If Auto-View is set to on, the movie will be moved to the VIEWED list.
							</td>
						</tr>
						<tr>
							<td>viewed</td>
							<td>Same as the GET command, but relates to the VIEWED list only.</td>
						</tr>
						<tr>
							<td>removeviewed</td>
							<td>Same as the REMOVE command, but relates to the VIEWED list only. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>setviewed</td>
							<td>Will move the specified movie from the UNVIEWED list to the VIEWED list. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>pollmessage</td>
							<td>Sets the message the bot sends when a poll begins. Can mention users, roles etc. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>pollsize</td>
							<td>Sets the number of movies in a poll. Size must be a minimum of 1 and maximum 10. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>polltime</td>
							<td>Sets the length of time a poll will run. The number must be in SECONDS! Maximum is currently 2 hours, may be increased later. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>pollrole</td>
							<td>Mention a role in your command, users with this role will then be able to start polls rather than just administrators. To clear this setting use 'pollrole clear' <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>autoview</td>
							<td>Specify ON or OFF. When this setting is on, movies will automatically be moved to the VIEWED list after a poll or random command. Default is off. <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>moviesrole</td>
							<td>Mention a role in your command, to limit the ADD command to this role and administrators. To clear this setting use ‘moviesrole clear’ <br/><br/>(Administrator only).</td>
						</tr>
						<tr>
							<td>prefix</td>
							<td>Updates the prefix to be whatever you wish to set it as. <br/><br/>(Administrator only).</td>
						</tr>
						
					</tbody>
				</Table>
			</Container>
			<FooterComponent />
		</div>
	);
}