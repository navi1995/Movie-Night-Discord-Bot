import React from 'react';
import { Container, Button, Jumbotron } from 'react-bootstrap';

export function ErrorComponent(props) {
	const { message, func } = props;

	return (
		<Jumbotron className='error-message'>
			<Container>
				<h1>{message}</h1>
				<p>
					<Button onClick={func} variant='primary'>Go Back</Button>
				</p>
			</Container>
		</Jumbotron>
	);
}
