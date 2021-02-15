import React from 'react';
import { Spinner } from 'react-bootstrap';

export function Loader(props) {
	const loading = props.loading;
	
	if (!loading) {
		return null;
	} else {
		return (
			<div className='flex flex-column align-items-center'>
				<Spinner className='page-loader' animation='border' role='status' />
				<h1 className='loading-text'>Loading...</h1>
			</div>);
	}
}