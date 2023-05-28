import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { MovieComponent, ErrorComponent, Loader, FooterComponent } from "../../components";
import { Row, Container, ToggleButton, ButtonGroup, Button, Toast } from "react-bootstrap";
import { getMovies, exportToCSV } from "../../utils/utils";
import { useParams, useNavigate } from "react-router-dom";

export function Dashboard(props) {
	// const [user] = React.useState(props.user || []);
	const params = useParams();
	const [loading, setLoading] = React.useState(true);
	const [movies, setMovies] = React.useState([]);
	const [error, setError] = React.useState(null);
	const [guilds] = React.useState(props.guilds || []);
	const [radioValue, setRadioValue] = React.useState("ALL");
	const [responseMessage, setResponseMessage] = React.useState(null);
	const currentGuild = guilds.find((guild) => guild.id === params.id) || {};
	const navigate = useNavigate();

	function removeMovie(movieID, resp) {
		if (resp && resp.data && resp.data.success) {
			const newMovies = movies.filter((movie) => movie.movieID !== movieID);

			setMovies(newMovies);
		}

		setResponseMessage(<h5 style={!resp || !resp.data.success ? { color: "#721c24" } : {}}>{resp.data.message}</h5>);
		setTimeout(() => {
			setResponseMessage(null);
		}, 3000);
	}

	function toggleViewed(movieID, resp) {
		if (resp && resp.data && resp.data.success) {
			const newViewedValue = resp.data.viewed;
			const updatedMovies = movies.map(function (movie) {
				if (movie.movieID === movieID) {
					movie.viewed = newViewedValue;
				}

				return movie;
			});

			setMovies(updatedMovies);
		}

		setResponseMessage(<h5 style={!resp.data.success ? { color: "#721c24" } : {}}>{resp.data.message}</h5>);
		setTimeout(() => {
			setResponseMessage(null);
		}, 3000);
	}

	function loaderToast(message) {
		setResponseMessage(<h5>{message}</h5>);
	}

	function goBack() {
		try {
			navigate(-1);
		} catch (e) {
			window.location.href = process.env.REACT_APP_BASE_URL;
		}
	}

	function radioClick(e) {
		setRadioValue(e.currentTarget.value);
	}

	function exportClick(e) {
		exportToCSV(currentGuild.id);
	}

	function renderMovie(movie) {
		return radioValue === "ALL" || (radioValue === "VIEWED" && movie.viewed) || (radioValue === "UNVIEWED" && movie.viewed === false);
	}

	//If user already passed through, dont re-get user details
	React.useEffect(() => {
		setLoading(true);

		if (currentGuild.id) {
			//Do not get user details if we already have them. Need to stop hitting API twice.
			getMovies(params.id)
				.then(function (response) {
					if (response.data.message) {
						throw response.data.message;
					}

					console.log(response.data);
					setMovies(response.data);
					setLoading(false);
				})
				.catch(function (err) {
					if (err.response && err.response.data.message) {
						setError(err.response.data.message);
					} else {
						setError(err);
					}

					setLoading(false);
				});
		} else {
			setError("You do not have access to this guild.");
			setLoading(false);
		}
	}, [params.id, currentGuild.id]);

	return (
		<div className="dashboard-page">
			<Loader loading={loading} />
			{!loading && !error && (
				<Container fluid>
					<Row>
						<ButtonGroup style={{ width: "100%", borderRadius: "0px", padding: 0 }}>
							<ToggleButton onChange={radioClick} key={1} id={`filter${1}`} type="radio" variant="secondary" value="ALL" checked={radioValue === "ALL"}>
								All
							</ToggleButton>
							<ToggleButton onChange={radioClick} key={2} id={`filter${2}`} type="radio" variant="secondary" value="VIEWED" checked={radioValue === "VIEWED"}>
								Viewed
							</ToggleButton>
							<ToggleButton onChange={radioClick} key={3} id={`filter${3}`} type="radio" variant="secondary" value="UNVIEWED" checked={radioValue === "UNVIEWED"}>
								Unviewed
							</ToggleButton>
							<Button onClick={exportClick}>
								Export to CSV <FontAwesomeIcon icon={faDownload} />
							</Button>
						</ButtonGroup>
					</Row>
					<Row>
						{movies.map((movie, index) => (
							<MovieComponent movie={movie} index={index} key={index} render={renderMovie(movie, index)} adminLevel={currentGuild.adminLevel} onDelete={loaderToast} afterDelete={removeMovie} afterViewed={toggleViewed} />
						))}
						{movies.length === 0 && <h3 style={{ margin: "auto", marginTop: "2.5em", marginBottom: "2.5em" }}>No Movies =(</h3>}
					</Row>
					<Toast style={{ position: "fixed", bottom: "100px", right: 0, backgroundColor: "#36393f" }} show={responseMessage != null && responseMessage !== ""}>
						<Toast.Body style={{ marginBottom: 0 }}>{responseMessage}</Toast.Body>
					</Toast>
				</Container>
			)}
			{!loading && error && <ErrorComponent message={error} func={goBack} />}
			{!loading && <FooterComponent />}
		</div>
	);
}
