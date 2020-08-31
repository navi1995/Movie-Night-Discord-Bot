import React from 'react';
import { MovieComponent, ErrorComponent, Loader, FooterComponent } from '../../components';
import { Row, Container, ToggleButton, ButtonGroup, Toast } from 'react-bootstrap';
import { getMovies } from '../../utils/utils';;

export function Dashboard(props) {
	// const [user] = React.useState(props.user || []);
	const [loading, setLoading] = React.useState(true);
	const [movies, setMovies] = React.useState([]);
	const [error, setError] = React.useState(null);
	const [guilds] = React.useState(props.guilds || []);
	const [radioValue, setRadioValue] = React.useState('ALL');
	const [responseMessage, setResponseMessage] = React.useState(null);
	const currentGuild = guilds.find(guild => guild.id == props.match.params.id) || {};

	function removeMovie(movieID, resp) {
		if (resp.data && resp.data.success) {
			const newMovies = movies.filter(movie => movie.movieID != movieID);

			setMovies(newMovies);
		}

		setResponseMessage(<h5 style={!resp.data.success ? {color: '#721c24'} : {}}>{resp.data.message}</h5>);
		setTimeout(() => {
			setResponseMessage(null);
		}, 3000);
	}

	function toggleViewed(movieID, resp) {
		if (resp.data && resp.data.success) {
			const newViewedValue = resp.data.viewed;
			const updatedMovies = movies.map(function(movie) {
				if (movie.movieID == movieID) {
					movie.viewed = newViewedValue;
				}
				
				return movie;
			});

			setMovies(updatedMovies);
		}

		setResponseMessage(<h5 style={!resp.data.success ? {color: '#721c24'} : {}}>{resp.data.message}</h5>);
		setTimeout(() => {
			setResponseMessage(null);
		}, 3000);
	}

	function loaderToast(message) {
		setResponseMessage(<h5>{message}</h5>);
	}


	function goBack() {
		try { 
			props.history.goBack();
		} catch (e) {
			window.location.href = process.env.REACT_APP_BASE_URL;
		}
	}

	function radioClick(e) {
		setRadioValue(e.currentTarget.value);
	}

	function renderMovie(movie, index) {
		return (radioValue == 'ALL' || (radioValue == 'VIEWED' && movie.viewed) || (radioValue == 'UNVIEWED' && movie.viewed == false));
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
				if (err.response && err.response.data.message) {
					setError(err.response.data.message);
				} else {
					setError(err);
				}

				setLoading(false);
			});
		} else {
			setError('You do not have access to this guild.');
			setLoading(false);
		}
	}, [props.match.params.id, currentGuild.id]);

	return (
		<div>
			<Loader loading={loading} />
			{!loading && (
			<Container fluid className='dashboard-page'>
				<Row>
					<ButtonGroup toggle style={{width: '100%', borderRadius: '0px'}}>
						<ToggleButton onChange={radioClick} type='radio' variant='secondary' value='ALL' checked={radioValue == 'ALL'}>All</ToggleButton>
						<ToggleButton onChange={radioClick} type='radio' variant='secondary' value='VIEWED' checked={radioValue == 'VIEWED'}>Viewed</ToggleButton>
						<ToggleButton onChange={radioClick} type='radio' variant='secondary' value='UNVIEWED' checked={radioValue == 'UNVIEWED'}>Unviewed</ToggleButton>
					</ButtonGroup>
				</Row>
				<Row noGutters={true}>
				{
				movies.map((movie, index) => (
					<MovieComponent movie={movie} index={index} key={index} render={renderMovie(movie, index)} adminLevel={currentGuild.adminLevel} onDelete={loaderToast} afterDelete={removeMovie} afterViewed={toggleViewed}/>
				))
				}
				</Row>
				<Toast style={{ position: 'absolute', bottom: '100px', right: 0}} show={responseMessage != null && responseMessage != ''}>
					<Toast.Body>{responseMessage}</Toast.Body>
				</Toast>
			</Container>
			)}
			{!loading && (<FooterComponent />)}
			{!loading && error && (
				<ErrorComponent message={error} func={goBack} />
			)}
		</div>
	);
}