import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export function FooterComponent(props) {
	return (
		<div id='contactInfo' className='footer'>
			<Container className='container-footer'>
				<Row>
					<div className='info'>
						<h3>Contact Information</h3>
						<div className='badge-row'>
							<a href='mailto:navi.jador@gmail.com' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faEnvelope} size='3x' /></a>
							<a href='https://github.com/navi1995/Movie-Night-Discord-Bot' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGithub} size='3x' /></a>
						</div>

						<a href='mailto:navi.jador@gmail.com' target='_blank' rel='noopener noreferrer' >
							<h5>
								Email me if you have any problems or questions! <br />
								navi.jador@gmail.com
							</h5>
						</a>
						<a href='https://ko-fi.com/navijador' target='_blank' rel='noopener noreferrer'>Support the Dev! https://ko-fi.com/navijador</a>
						<div>© 2020 Movie Night Bot for Discord. Created by <a target='_blank' rel='noopener noreferrer' href='https://navijador.com'>Navi Jador</a></div>
					</div>
				</Row>
			</Container>
		</div>
);
}