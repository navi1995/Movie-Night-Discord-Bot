import axios from "axios";

export async function getUserDetails() {
	return axios.get(`${process.env.REACT_APP_API_FULLURL}auth`, {
		withCredentials: true,
	});
}

export async function getGuilds() {
	return axios.get(`${process.env.REACT_APP_API_FULLURL}discord/guilds`, {
		withCredentials: true,
	});
}

export function getMovies(guildID) {
	return axios.get(`${process.env.REACT_APP_API_FULLURL}discord/movies/${guildID}`, {
		withCredentials: true,
	});
}

export function getBotServers() {
	return axios.get(`${process.env.REACT_APP_BASE_API_URL}count`);
}

export function deleteMovieAPI(movie) {
	return axios.post(
		`${process.env.REACT_APP_API_FULLURL}discord/movies/delete`,
		{
			movieID: movie.movieID,
			guildID: movie.guildID,
		},
		{
			withCredentials: true,
		}
	);
}

export function toggleViewedAPI(movie) {
	return axios.post(
		`${process.env.REACT_APP_API_FULLURL}/discord/movies/viewed`,
		{
			movieID: movie.movieID,
			guildID: movie.guildID,
		},
		{
			withCredentials: true,
		}
	);
}

export function exportToCSV(guildID) {
	window.location.href = `${process.env.REACT_APP_API_FULLURL}discord/movies-csv/${guildID}`;
}
