document.addEventListener('DOMContentLoaded', (event) => {
	setupAutocomplete(document.querySelector('[name="source"]'), 'sourceDropdown');
    setupAutocomplete(document.querySelector('[name="destination"]'), 'destinationDropdown');
    document.getElementById('flightSearchForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        searchFlights(this); // Pass the form element to the function
    });
});

function searchFlights(formElement) {
    const formData = new FormData(formElement);
    const source = formData.get("source");
    const destination = formData.get("destination");
    const numStops = parseInt(formData.get("stops")) || 0;

    const n = flights.length; // Number of cities

    // Get city numbers for source and destination
    let src,dst;
    if (cityToNode.hasOwnProperty(source)) {
        src = cityToNode[source];
    } else {
        alert(`Source city "${source}" not found.`);
        throw new Error(`Source city "${source}" not found.`);
    }

    // Check if destination exists in cityToNode
    if (cityToNode.hasOwnProperty(destination)) {
        dst = cityToNode[destination];
    } else {
        alert(`Destination city "${destination}" not found.`);
        throw new Error(`Destination city "${destination}" not found.`);
    }

    // Call the findCheapestPrice function with the provided inputs
    const {dist:cheapestPrice, stops:countedStops} = findCheapestPrice(n, flights, src, dst, numStops) === -1?  findCheapestPrice(n, flights, dst, src, numStops): findCheapestPrice(n, flights, src, dst, numStops);

	// const cheapestPrice = findAllFlightsWithPrices(n, flights, src, dst, numStops);

    console.log("cheapestprice",cheapestPrice);

    const resultDiv = document.getElementById("result");
    if (cheapestPrice !== -1) {
        resultDiv.innerHTML = `
		<div
			class="w-full sm:w-auto flex items-center p-3 m-auto text-base font-bold gap-6 text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
		>
			<p class="">${source} to ${destination}</p>
        <p>Price: ${cheapestPrice}</p>
        <p>Stops: ${countedStops}</p>
			<span
				class="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400"
				>Cheapest Flight</span
			>
		</div>
        `;
    } else {
        resultDiv.innerHTML = `
		<div
			class="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
		>
			<span class="flex-1 ms-3 whitespace-nowrap">No results found</span>
		</div>
		`
    }
}

export var findAllFlightsWithPrices = function (n, flights, src, dst, k) {
    // Creating the graph
    const gr = new Array(n).fill().map(() => []);

    // Filling the graph
    for (const e of flights) {
        gr[e[0]].push([e[1], e[2]]);
    }

    // Initializing the priority queue and stops array
    const stops = new Array(n).fill(Number.MAX_SAFE_INTEGER);
    const pq = [[0, src, 0, [src]]]; // Added path tracking
    const allFlights = [];

    while (pq.length) {
        const [dist, node, steps, path] = pq.shift();

        if (steps > stops[node] || steps > k + 1) continue;

        stops[node] = steps;
        if (node === dst) {
            allFlights.push({ cost: dist, path: [...path, dst] }); // Store the path and its cost
            continue;
        }

        for (const [neighbour, price] of gr[node]) {
            pq.push([dist + price, neighbour, steps + 1, [...path, neighbour]]);
        }

        // Re-sort the priority queue
        pq.sort((a, b) => a[0] - b[0]);
    }

    // Sort all flights by cost
    allFlights.sort((a, b) => a.cost - b.cost);

    return allFlights.length > 0 ? allFlights : -1;
};
export const flights = [
	[0, 1, 5000], // Delhi to Mumbai
	[0, 2, 6000], // Delhi to Kolkata
	[0, 3, 7000], // Delhi to Chennai
	[0, 4, 5500], // Delhi to Bangalore
	[0, 5, 8000], // Delhi to Hyderabad
	[1, 2, 5500], // Mumbai to Kolkata
	[1, 3, 6500], // Mumbai to Chennai
	[1, 4, 6000], // Mumbai to Bangalore
	[1, 5, 7500], // Mumbai to Hyderabad
	[2, 3, 5000], // Kolkata to Chennai
	[2, 4, 4500], // Kolkata to Bangalore
	[2, 5, 7000], // Kolkata to Hyderabad
	[3, 4, 4000], // Chennai to Bangalore
	[3, 5, 6500], // Chennai to Hyderabad
	[3, 6, 8500], // Chennai to Pune
	[4, 5, 6000], // Bangalore to Hyderabad
	[4, 6, 8000], // Bangalore to Pune
	[4, 7, 9000], // Bangalore to Jaipur
	[5, 6, 7000], // Hyderabad to Pune
	[5, 7, 9500], // Hyderabad to Jaipur
	[5, 8, 10000], // Hyderabad to Ahmedabad
	[6, 7, 7500], // Pune to Jaipur
	[6, 8, 8500], // Pune to Ahmedabad
	[6, 9, 7500], // Pune to Lucknow
	[7, 8, 9000], // Jaipur to Ahmedabad
	[7, 9, 8500], // Jaipur to Lucknow
	[7, 10, 9500], // Jaipur to Patna
	[8, 9, 8000], // Ahmedabad to Lucknow
	[8, 10, 8500], // Ahmedabad to Patna
	[8, 11, 9500], // Ahmedabad to Bhopal
	[9, 10, 7000], // Lucknow to Patna
	[9, 11, 7500], // Lucknow to Bhopal
	[9, 12, 8000], // Lucknow to Indore
	[10, 11, 6500], // Patna to Bhopal
	[10, 12, 7000], // Patna to Indore
	[10, 13, 7500], // Patna to Chandigarh
	[11, 12, 6000], // Bhopal to Indore
	[11, 13, 6500], // Bhopal to Chandigarh
	[11, 14, 7000], // Bhopal to Kanpur
];
export const cityToNode = {
	Delhi: 0,
	Mumbai: 1,
	Kolkata: 2,
	Chennai: 3,
	Bangalore: 4,
	Hyderabad: 5,
	Pune: 6,
	Jaipur: 7,
	Ahmedabad: 8,
	Lucknow: 9,
	Patna: 10,
	Bhopal: 11,
	Indore: 12,
	Chandigarh: 13,
	Kanpur: 14,
};
export var findCheapestPrice = function (n, flights, src, dst, k) {
	// Creating the graph
	const gr = new Array(n).fill().map(() => []);

	// Filling the graph
	for (const e of flights) {
		gr[e[0]].push([e[1], e[2]]);
	}

	// Initializing the priority queue and stops array
	const stops = new Array(n).fill(Number.MAX_SAFE_INTEGER);
	const pq = [[0, src, 0]];

	while (pq.length) {
		const [dist, node, steps] = pq.shift();

		if (steps > stops[node] || steps > k + 1) continue;

		stops[node] = steps;
		if (node === dst) return {dist, stops: stops[node]}

		for (const [neighbour, price] of gr[node]) {
			pq.push([dist + price, neighbour, steps + 1]);
		}

		// Re-sort the priority queue
		pq.sort((a, b) => a[0] - b[0]);
	}
	return {dist: -1,stops:-1};
};

function setupAutocomplete(inputElement, dropdownId) {
    const dropdownEl = document.createElement('div');
    dropdownEl.id = dropdownId;
    dropdownEl.className = 'z-50 absolute w-full border border-gray-300 rounded-md bg-gray-200 overflow-y-auto hidden max-h-60';
    inputElement.parentNode.appendChild(dropdownEl);

    inputElement.addEventListener('keyup', (e) => {
        const keyword = e.target.value;
        dropdownEl.classList.remove('hidden');
        const filteredCities = Object.keys(cityToNode).filter(city =>
            city.toLowerCase().includes(keyword.toLowerCase())
        );

        renderOptions(filteredCities, dropdownEl, inputElement);
    });

    document.addEventListener('click', () => {
        dropdownEl.classList.add('hidden');
    });

    inputElement.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function renderOptions(options, dropdownEl, inputElement) {
    let newHtml = '';

    options.forEach((city) => {
        newHtml += `<div
            onclick="selectOption('${city}', '${inputElement.id}')"
            class="px-5 py-3 border-b border-gray-200 text-stone-600 cursor-pointer hover:bg-slate-100 transition-colors"
        >
            ${city}
        </div>`;
    });

    dropdownEl.innerHTML = newHtml;
}

window.selectOption = function(selectedOption, inputId) {
    const input = document.getElementById(inputId);
    input.value = selectedOption;
    document.getElementById(inputId + 'Dropdown').classList.add('hidden');
};
