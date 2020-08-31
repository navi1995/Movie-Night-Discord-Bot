import axios from 'axios';

export function getUserDetails() {
	console.log(`${process.env.REACT_APP_API_FULLURL}auth`);
	return axios.get(`${process.env.REACT_APP_API_FULLURL}auth`, {
		withCredentials: true
	});
}

export function getGuilds() {
	return axios.get(`${process.env.REACT_APP_API_FULLURL}discord/guilds`, {
		withCredentials: true
	});
}

export function getMovies(guildID) {
	return axios.get(`${process.env.REACT_APP_API_FULLURL}discord/movies/${guildID}`, {
		withCredentials: true
	});
}

export function getBotServers() {
	return axios.get('https://top.gg/api/bots/709271563110973451/stats', {
		headers: {
			'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcwOTI3MTU2MzExMDk3MzQ1MSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTkxNjkwMjczfQ.bOcA6o-pSaWsvdz4n3Pu5JOiz2ZNajrV9ejld96xOqs'
		}
	})
}

export function deleteMovieAPI(movie) {
	return axios.post(`${process.env.REACT_APP_API_FULLURL}discord/movies/delete`, { 
		movieID: movie.movieID,
		guildID: movie.guildID 
	}, {
		withCredentials: true
	});
}

export function toggleViewedAPI(movie) {
	return axios.post(`${process.env.REACT_APP_API_FULLURL}/discord/movies/viewed`, { 
		movieID: movie.movieID,
		guildID: movie.guildID 
	}, {
		withCredentials: true
	});
}