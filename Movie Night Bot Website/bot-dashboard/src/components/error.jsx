import React from 'react';
import { Container,Button, Jumbotron } from 'react-bootstrap';

export function ErrorComponent(props) {
	return (
		<Jumbotron className="error-message">
			<Container>
			<h1>{props.message}</h1>
			<p>
				<Button onClick={props.func} variant="primary">Go Back</Button>
			</p>
			</Container>
		</Jumbotron>
	);
}