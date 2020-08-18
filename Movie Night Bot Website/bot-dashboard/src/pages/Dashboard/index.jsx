import React from 'react';
import axios from 'axios';
import { MovieComponent } from '../../components/movie';
import { ErrorComponent } from '../../components/error';
import { Loader } from '../../components/loader';
import { Row, Container } from 'react-bootstrap';

export function Dashboard(props) {
	const userTest = props.user || null;
	const [user, setUser] = React.useState(userTest || []);
	const [loading, setLoading] = React.useState(true);
	const [movies, setMovies] = React.useState([]);
	const [error, setError] = React.useState(null);

	function goBack() {
		//props.history.push('/')
		props.history.goBack();
	}

	//If user already passed through, dont re-get user details
	React.useEffect(() => {
		//Do not get user details if we already have them. Need to stop hitting API twice. 
		getUserDetails().then(function(response) {
			setUser(response.data);
		}).then(function() {
			console.log(props.match.params);
			return getMovies(props.match.params.id);
		}).then(function(response) {
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
	}, []);

	return (
		<div>
			{/* <NavbarComponent user={user} /> */}
			<Loader loading={loading} />
			{!loading && (
			<Container fluid className="dashboard-page">
				<Row noGutters={true}>
				{
				movies.map((movie, index) => (
					<MovieComponent movie={movie} index={index} key={index}/>
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

function getUserDetails() {
	return axios.get('http://localhost:3001/api/auth', {
		withCredentials: true
	});
}

function getMovies(guildID) {
	return axios.get(`http://localhost:3001/api/discord/movies/${guildID}`, {
		withCredentials: true
	});
}