import React from 'react';
import { ListGroup, Card, Col } from 'react-bootstrap';
import moment from 'moment';

export function MovieComponent(props) {
	const movie = props.movie;

	return (
		<Col xl={2} lg={4} md={4} sm={6} xs={6} key={props.index} >
			<Card className="text-center" key={movie.imdbID}>
				{ movie.posterURL && movie.posterURL.indexOf(".jpg") > 0
					? <Card.Img variant="top" src={movie.posterURL.replace('original', 'w300')} />
					: <Card.Img variant="top" className="default-image" src="/images/default.png" />
				}
				<Card.Body>
					<Card.Title>{movie.name}</Card.Title>
					<Card.Subtitle className="mb2 text-muted">Release Date: {moment(movie.releaseDate).format("DD MMM YYYY")}</Card.Subtitle>
					<Card.Text>{movie.overview.length > 100 ? movie.overview.substr(0, 97) + '...' : movie.overview}</Card.Text>
					<ListGroup variant="flush">
						<ListGroup.Item>Runtime: {movie.runtime} Minutes</ListGroup.Item>
						<ListGroup.Item>Rating: {movie.rating} / 10</ListGroup.Item>
						<ListGroup.Item>Submitted: {moment(movie.submitted).format("DD MMM YYYY")}</ListGroup.Item>
						<ListGroup.Item>Status: {movie.viewed ? "Viewed" : "Unviewed"}</ListGroup.Item>
					</ListGroup>
				</Card.Body>
			</Card>
		</Col>
	);
}