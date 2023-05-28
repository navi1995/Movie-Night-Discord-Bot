import React from "react";
import { Container, Button } from "react-bootstrap";

export function ErrorComponent(props) {
	const { message, func } = props;
	console.log(message.toString());

	return (
		<div className="jumbotron container-fluid text-sm-center p-5 error-message">
			<Container>
				<h1>{message.toString()}</h1>
				<p>
					<Button onClick={func} variant="primary">
						Go Back
					</Button>
				</p>
			</Container>
		</div>
	);
}
