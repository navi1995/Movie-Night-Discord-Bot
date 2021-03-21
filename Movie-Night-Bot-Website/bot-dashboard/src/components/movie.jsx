import React from 'react';
import { ListGroup, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { deleteMovieAPI, toggleViewedAPI } from '../utils/utils';
import moment from 'moment';

export function MovieComponent(props) {
	const movie = props.movie;
	const render = props.render;
	const onDelete = props.onDelete;
	const afterDelete = props.afterDelete;
	const afterViewed = props.afterViewed;
	const adminLevel = props.adminLevel;
	const [show, setShow] = React.useState(false);

	function toggleTextBody(e) {
		setShow(!show);
	}

	function deleteMovie() {
		if (window.confirm('Are you sure?')) {
			onDelete('Deleting...');
			deleteMovieAPI(movie).then(function(resp) {
				console.log(resp);
				afterDelete(movie.movieID, resp);
			}).catch(function(err, resp) {
				console.log(err.response);
				afterDelete(movie.movieID, err.response);
			});
		}
	}

	function toggleViewed() {
		if (window.confirm('Are you sure?')) {
			onDelete(`Setting movie to ${!movie.viewed ? 'viewed' : 'unviewed'}...`);
			toggleViewedAPI(movie).then(function(resp) {
				console.log(resp);
				afterViewed(movie.movieID, resp);
			}).catch(function(err, resp) {
				console.log(err.response);
				afterViewed(movie.movieID, err.response);
			});
		}
	}

	if (!render) {
		return null;
	}

	return (
		<div className="movie" key={movie.imdbID} >
			<div className="poster-container">
				{ movie.viewed && <FontAwesomeIcon icon={faEye} size='2x' color='#03a9f4' className='viewed-icon' alt='Movie has been viewed' /> }
				<img alt='' style={{ marginRight: 'auto', marginLeft: 'auto', display: 'block' }}src={ movie.posterURL && movie.posterURL.indexOf('.jpg') > 0 ? movie.posterURL.replace('original', 'w300') : '/images/default.png'} />
				<div className={'hover-toggle'}>
					<ListGroup variant='flush'>
						<ListGroup.Item>Runtime: {movie.runtime} Minutes</ListGroup.Item>
						<ListGroup.Item>Rating: {movie.rating} / 10</ListGroup.Item>
						<ListGroup.Item>Submitted: {moment(movie.submitted).format('DD MMM YYYY')}</ListGroup.Item>
						<ListGroup.Item>Status: {movie.viewed ? 'Viewed' : 'Unviewed'}</ListGroup.Item>
					</ListGroup>
				</div>
			</div>
			{adminLevel == 'admin' && (
				<ButtonGroup className='movie-button-group'>
						<Button variant='primary' onClick={toggleViewed}>{'Set ' + (movie.viewed ? 'Unviewed' : 'Viewed')}</Button>
						<Button variant='danger' onClick={deleteMovie}>Delete</Button>
				</ButtonGroup>)}
			<div className="movie-details">
				<h3>{movie.imdbID && (<a target='_blank' rel='noopener noreferrer' href={`https://www.imdb.com/title/${movie.imdbID}`}>{movie.name}</a>)}{!movie.imdbID ? movie.name : ''}</h3>
				<div className="mb2 text-muted card-subtitle h6">Release Date: {moment(movie.releaseDate).format('DD MMM YYYY')}</div>
				<div className="movie-description" onClick={toggleTextBody}>
					{!show && movie.overview.length > 100 ? movie.overview.substr(0, 97) + '... (Click to expand)' : movie.overview}
					<div className={!show ? 'hidden-toggle' : ''}>
						<ListGroup variant='flush'>
							<ListGroup.Item>Runtime: {movie.runtime} Minutes</ListGroup.Item>
							<ListGroup.Item>Rating: {movie.rating} / 10</ListGroup.Item>
							<ListGroup.Item>Submitted: {moment(movie.submitted).format('DD MMM YYYY')}</ListGroup.Item>
							<ListGroup.Item>Status: {movie.viewed ? 'Viewed' : 'Unviewed'}</ListGroup.Item>
						</ListGroup>
					</div>
				</div>
			</div>
			<div className="button-container">
				<Button onClick={toggleTextBody} variant='primary' className='w-100'><FontAwesomeIcon icon={!show ? faPlus : faMinus} /></Button>
			</div>
		</div>
	);
}