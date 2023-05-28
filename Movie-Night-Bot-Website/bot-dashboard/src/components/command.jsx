import React from "react";
import { Card, Col } from "react-bootstrap";

export function Command(props) {
	const title = props.title;
	const children = props.children;

	return (
		<Col style={{ paddingBottom: "20px" }}>
			<Card className="text-light">
				<Card.Header as="h5">{title}</Card.Header>
				<Card.Body>{children}</Card.Body>
			</Card>
		</Col>
	);
}
