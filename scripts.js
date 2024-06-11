// Main entry point of the app
const app = document.getElementById('root')

// Create sorting and filtering controls
const sortSelect = document.createElement('select');
sortSelect.id = 'sort-select';
sortSelect.innerHTML = `
    <option value="default">Default</option>
`;
app.appendChild(sortSelect);

const filterSelect = document.createElement('select');
filterSelect.id = 'filter-select';
filterSelect.innerHTML = `
    <option value="all">All</option>
    <option value="grass">Grass</option>
    <option value="fire">Fire</option>
    <option value="water">Water</option>
    <option value="electric">Electric</option>
    <option value="poison">Poison</option>
    <option value="psychic">Pyschic</option>
    <option value="normal">Normal</option>
    <option value="ground">Ground</option>
    <option value="rock">Rock</option>
    <option value="bug">Bug</option>
    <option value="flying">Flying</option>
    <option value="fairy">Fairy</option>
    <option value="dragon">Dragon</option>
    <option value="ice">Ice</option>
`;
app.appendChild(filterSelect);



// Function to filter Pokémon cards based on the current filter option
function filterPokemonCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const typeImages = card.querySelectorAll('.type-image');
        const types = Array.from(typeImages).map(img => img.alt);
        const typeContainer = card.querySelector('.type-image-container');
        if (currentFilterOption === 'all') {
            // Show all Pokémon
            card.style.display = 'block';
        } else {
            if (types.includes(currentFilterOption)) {
                card.style.display = 'block'; // Show Pokémon of the selected type
            } else {
                card.style.display = 'none'; // Hide Pokémon not of the selected type
            }
        }
    });
}

// Define global variables to store current sorting and filtering options
let currentSortOption = 'default'; // Default sorting
let currentFilterOption = 'all'; // Show all Pokémon by default

// Create logo element and add to the app
const logo = document.createElement('img')
logo.src = 'logo.png'
logo.style.width = '300px'
app.appendChild(logo)

// Create container element and add to the app
const container = document.createElement('div')
container.setAttribute('class', 'container')
app.appendChild(container)

// Add event listeners to sorting and filtering controls
sortSelect.addEventListener('change', () => {
    currentSortOption = sortSelect.value;
    sortPokemonCards();
});

filterSelect.addEventListener('change', () => {
    currentFilterOption = filterSelect.value;
    filterPokemonCards();
});

// Create request variable and assign a new XMLHttpRequest object to it
var request = new XMLHttpRequest()

// Open a new connection, using GET request on the URL endpoint
request.open('GET', 'https://pokeapi.co/api/v2/pokemon/?limit=1025', true)

// Define callback function to be executed when request is completed
request.onload = function () {
 // Check if the status code indicates a successful response
 if (request.status >= 200 && request.status < 400) {
    // Parse JSON response text into a JavaScript object
    var data = JSON.parse(request.responseText)

    // Iterate over the array of Pokemon objects in the 'results' property
    data.results.forEach((pokemon, index) => {
      // Extract Pokemon number from the URL
      const pokemonNum = index + 1

      // Fetch additional details for each Pokémon
      fetch(pokemon.url)
        .then((response) => response.json())
        .then((pokemonDetails) => {
          // Create a div with a card class
          const card = document.createElement('div')
          card.setAttribute('class', 'card')

          // Create an h1 and set the text content to the Pokemon's name
          const h1 = document.createElement('h1')
          h1.textContent = `${pokemonNum}. ${pokemonDetails.name}`

          // Fetch additional details using the associated link
          fetch(pokemonDetails.species.url)
            .then((response) => response.json())
            .then((speciesDetails) => {
              // Get the description using the custom function
              const description = getPokemonDescription(speciesDetails)
              const p = document.createElement('p')
              p.textContent = description

              // Create an img element for the Pokemon's picture
              const img = document.createElement('img')
              img.src = pokemonDetails.sprites.front_default
              img.alt = pokemonDetails.name

              // Create array to hold type images
              const typeImages = pokemonDetails.types.map((type) => {
                const typeImg = document.createElement('img')
                typeImg.src = `types/${type.type.name}.png`
                typeImg.alt = type.type.name
                typeImg.classList.add('type-image') // Add class for styling
                return typeImg
              })

              // Create a div to hold type images
              const typeImageContainer = document.createElement('div')
              typeImageContainer.classList.add('type-image-container')

              // Create back content to the card
              const backContent = createBackContent(pokemonDetails)
              card.appendChild(backContent)

              // Add click even listener to card to toggle 'flipped' class
              card.addEventListener('click', () => {
                card.classList.toggle('flipped')
              })

              // Append the elements to the container element
              container.appendChild(card)
              card.appendChild(h1)
              card.appendChild(img)

              typeImages.forEach((typeImg) => {
                typeImageContainer.appendChild(typeImg)
              })
              card.appendChild(typeImageContainer)
              card.appendChild(p)
            })
            .catch((error) => {
              console.error('Error fetching species details', error)
            })
        })
        .catch((error) => {
          console.error('Error fetching Pokémon details', error)
        })
    })
 } else {
    const errorMessage = document.createElement('marquee')
    errorMessage.textContent = 'ERROR FETCHING'
    app.appendChild(errorMessage)
 }
}

// Function to get the description from pokemonDetails
function getPokemonDescription(pokemonDetails) {
 const englishDescription = pokemonDetails.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
 )
 return englishDescription ? englishDescription.flavor_text : "Description not available"
}

// Define a function to create the back content of the card
function createBackContent(pokemonDetails) {
 const backContent = document.createElement('div')
 backContent.classList.add('back-content')

 const abilities = document.createElement('p')
 abilities.textContent = `Abilities: ${pokemonDetails.abilities.map(ability => ability.ability.name).join(', ')}`
 backContent.appendChild(abilities)


 // Convert height frrom dectograms to feet and inches
 const heightInDecimeters = pokemonDetails.height
 const heightInFeet = (heightInDecimeters * 0.328084).toFixed(2)
 const heightFeet = Math.floor(heightInFeet)
 const heightInches = Math.round((heightInFeet - heightFeet) * 12)

 // Convert weight from hectograms to pounds
 const weightInHectograms = pokemonDetails.weight
 const weightInPounds = (weightInHectograms * 0.22046226218).toFixed(2)

 // Create an element to display height and weight content
 const heightweightElement = document.createElement('p')
 heightweightElement.textContent = `Height: ${heightFeet} ft ${heightInches} in || Weight: ${weightInPounds} lbs`
 backContent.appendChild(heightweightElement)

 // Create a canvas element for the stats chart
 const statsCanvas = document.createElement('canvas')
 statsCanvas.id = 'stats-chart'
 statsCanvas.width = 200
 statsCanvas.height = 200

 backContent.appendChild(statsCanvas)

 // Create stats chart using Chart.js
 createStatsChart(statsCanvas, pokemonDetails.stats)

 return backContent
}

function createStatsChart(canvas, stats) {
 const labels = stats.map(stat => stat.stat.name)
 const values = stats.map(stat => stat.base_stat)

 const ctx = canvas.getContext('2d')
 new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Stats',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
 })
}

// Send the request
request.send()
