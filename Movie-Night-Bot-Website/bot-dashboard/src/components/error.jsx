import React from 'react';
import { Container, Button, Jumbotron } from 'react-bootstrap';

export function ErrorComponent(props) {
	const { message, func } = props;
	console.log(message.toString());

	return (
		<Jumbotron className='error-message'>
			<Container>
				<h1>{message.toString()}</h1>
				<p>
					<Button onClick={func} variant='primary'>Go Back</Button>
				</p>
			</Container>
		</Jumbotron>
	);
}
