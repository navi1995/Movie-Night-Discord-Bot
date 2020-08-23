import React from 'react';
import { ListGroup, Card, Col, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';

export function MovieComponent(props) {
	const movie = props.movie;
	const [show, setShow] = React.useState(false);

	function toggleTextBody() {
		setShow(!show);
	}

	return (
		<Col xl={2} lg={4} md={4} sm={6} xs={6} key={props.index} >
			<Card className="text-center" key={movie.imdbID}>
				{ movie.posterURL && movie.posterURL.indexOf(".jpg") > 0
					? <Card.Img variant="top" src={movie.posterURL.replace('original', 'w300')} />
					: <Card.Img variant="top" className="default-image" src="/images/default.png" />
				}
				{ movie.viewed && <FontAwesomeIcon icon={faEye} size="2x" color="#03a9f4" className="viewed-icon" alt="Movie has been viewed" /> }
				<ButtonGroup className="movie-button-group">
						<Button variant="primary">Viewed</Button>
						<Button variant="danger">Delete</Button>
				</ButtonGroup>
				<Card.Body>
					<Card.Title>{movie.name}</Card.Title>
					<Card.Subtitle className="mb2 text-muted">Release Date: {moment(movie.releaseDate).format("DD MMM YYYY")}</Card.Subtitle>
					<Card.Text onClick={toggleTextBody}>{!show && movie.overview.length > 100 ? movie.overview.substr(0, 97) + '... (Click to expand)' : movie.overview}</Card.Text>
					<div class="hidden-toggle">
						<ListGroup variant="flush">
							<ListGroup.Item>Runtime: {movie.runtime} Minutes</ListGroup.Item>
							<ListGroup.Item>Rating: {movie.rating} / 10</ListGroup.Item>
							<ListGroup.Item>Submitted: {moment(movie.submitted).format("DD MMM YYYY")}</ListGroup.Item>
							<ListGroup.Item>Status: {movie.viewed ? "Viewed" : "Unviewed"}</ListGroup.Item>
						</ListGroup>
					</div>
					<Button variant="primary" className="w-100"><FontAwesomeIcon icon={faPlus} /></Button>
				</Card.Body>
			</Card>
		</Col>
	);
}