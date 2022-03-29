// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch (error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	try {
		//TODO - Get player_id and track_id from the store
		const player_id = store.player_id;
		const track_id = store.track_id;

		if (!player_id) {
			alert('You need to select a player');
		} else if (!track_id) {
			alert('You need to select a track')
		} else {

			const race = await createRace(player_id, track_id);

			//TODO - For the API to work properly, the race id should be race id - 1
			store.race_id = race.ID - 1;

			//TODO - render starting UI
			renderAt('#race', renderRaceStartView(race.Track, race.Cars));

			//TODO - calling async functions for countdown
			await runCountdown();

			// TODO - call the async function startRace
			await startRace(store.race_id);

			// TODO - call the async function runRace
			await runRace(store.race_id);
		}

	} catch (err) {
		console.log(`There's an error in the handleCreateRace function`, err.message);
		console.log(err);
	}

}


function runRace(raceID) {
	return new Promise(resolve => {
		// setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {

			try {

				const response = await getRace(raceID);

				if (response.status === "in-progress") {
					renderAt('#leaderBoard', raceProgress(response.positions));

				} else if (response.status === "finished") {
					clearInterval(raceInterval);
					renderAt('#race', resultsView(response.positions));
					resolve(response);
				} else {
					clearInterval(raceInterval);
					resolve(response);
				}

			} catch (err) {
				console.log(`Error at getRace function `, err.message);
				console.log(err);

			}

		}, 500);

	});

};

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// use Javascript's built in setInterval method to count down once per second
			const countDown = setInterval(() => {
				if (timer > 0) {
					// run this DOM manipulation to decrement the countdown for the user
					document.getElementById('big-numbers').innerHTML = --timer
					// console.log(timer);

				} else {
					//  if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(countDown);
					resolve();
				}
			}, 1000)
		})
	} catch (err) {
		console.log(`Error at runCountdown function`, err.message);
		console.log(err);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id);

	//TODO - remove class selected from all racer options
	const selected = document.querySelector('#racers .selected');
	if (selected) {
		selected.classList.remove('selected');
	}

	//TODO - add class selected to current target
	target.classList.add('selected');

	//TODO - save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	//TODO - remove class selected from all track options
	const selected = document.querySelector('#tracks .selected');
	if (selected) {
		selected.classList.remove('selected');
	}

	//TODO - add class selected to current target
	target.classList.add('selected');

	//TODO - save the selected track id to the store
	store.track_id = parseInt(target.id);
}

function handleAccelerate() {
	console.log("accelerate button clicked")

	//TODO - Invoke the API call to accelerate
	accelerate(store.race_id)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>
			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	const userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	}
}

//TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	//TODO - GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
		.then(res => res.json())
		.catch(err => console.log('Error at getting the tracks: ', err))
}

function getRacers() {
	//TODO - GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
		.then(res => res.json())
		.catch(err => console.log('Error at getting racers: ', err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
		.then(res => res.json())
		.catch(err => console.log("Error at createRace::", err))
}

function getRace(id) {
	//TODO - GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
		.then(res => res.json())
		.catch(err => console.log('Error at fetching race id: ', err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.catch(err => console.log("Error at getRace request::", err))
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
		.catch(err => console.log("Error at accelerate request::", err))
}