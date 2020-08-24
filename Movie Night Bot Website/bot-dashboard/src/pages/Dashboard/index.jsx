import React from 'react';
import axios from 'axios';
import { MovieComponent } from '../../components/movie';
import { ErrorComponent } from '../../components/error';
import { Loader } from '../../components/loader';
import { Row, Container, ToggleButton, ButtonGroup, Form, FormControl } from 'react-bootstrap';

export function Dashboard(props) {
	const [user] = React.useState(props.user || []);
	const [loading, setLoading] = React.useState(true);
	const [movies, setMovies] = React.useState([]);
	const [error, setError] = React.useState(null);
	const [guilds, setGuild] = React.useState(props.guilds || []);
	const [radioValue, setRadioValue] = React.useState('ALL');
	const currentGuild = guilds.find(guild => guild.id == props.match.params.id) || {};


	function goBack() {
		//props.history.push('/')
		console.log(user);
		props.history.goBack();
	}

	function radioClick(e) {
		setRadioValue(e.currentTarget.value);
	}

	function renderMovie(movie, index) {
		if (radioValue == "ALL" || (radioValue == "VIEWED" && movie.viewed) || (radioValue == "UNVIEWED" && movie.viewed == false)) {
			return true;
		} else {
			return false;
		}
	}

	//If user already passed through, dont re-get user details
	React.useEffect(() => {
		setLoading(true);
		
		if (currentGuild.id) {
		//Do not get user details if we already have them. Need to stop hitting API twice. 
			getMovies(props.match.params.id).then(function(response) {
				if (response.data.message) {
					throw response.data.message;
				}

				console.log(response.data);
				setMovies(response.data);
				setLoading(false);
			}).catch(function(err) {
				//props.history.push('/');
				if (err.response && err.response.data.message) {
					setError(err.response.data.message);
				} else {
					setError(err);
				}

				setLoading(false);
			});
		} else {
			setError("You do not have access to this guild.");
			setLoading(false);
		}
	}, [props.match.params.id]);

	return (
		<div>
			{/* <NavbarComponent user={user} /> */}
			<Loader loading={loading} />
			{!loading && (
			<Container fluid className="dashboard-page">
				<Row>
					<ButtonGroup toggle style={{width: "100%", borderRadius: "0px"}}>
						<ToggleButton onChange={radioClick} type="radio" variant="secondary" value="ALL" checked={radioValue == 'ALL'}>All</ToggleButton>
						<ToggleButton onChange={radioClick} type="radio" variant="secondary" value="VIEWED" checked={radioValue == 'VIEWED'}>Viewed</ToggleButton>
						<ToggleButton onChange={radioClick} type="radio" variant="secondary" value="UNVIEWED" checked={radioValue == 'UNVIEWED'}>Unviewed</ToggleButton>
					</ButtonGroup>
					<Form inline>
						<FormControl type="text" placeholder="Search" />
					</Form>
				</Row>
				<Row noGutters={true}>
				{
				movies.map((movie, index) => (
					<MovieComponent movie={movie} index={index} key={index} render={renderMovie(movie, index)} adminLevel={currentGuild.adminLevel}/>
				))
				}
				</Row>
			</Container>
			)}
			{!loading && error && (
				<ErrorComponent message={error} func={goBack} />
			)}
		</div>
	);
}

function getMovies(guildID) {
	return axios.get(`http://localhost:3001/api/discord/movies/${guildID}`, {
		withCredentials: true
	});
}