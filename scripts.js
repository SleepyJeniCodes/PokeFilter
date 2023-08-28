const app = document.getElementById('root')

const logo = document.createElement('img')
logo.src = 'logo.png'
logo.style.width = '300px'

const container = document.createElement('div')
container.setAttribute('class', 'container')

app.appendChild(logo)
app.appendChild(container)

// Create request variable and assign a new XMLHttpRequest object to it
var request = new XMLHttpRequest()

// Open a new connection, using GET request on the URL endpoint
request.open('GET', 'https://pokeapi.co/api/v2/pokemon/?limit=151', true)

// Define callback function to be executed when request is completed
request.onload = function () {
  // Check if the status code indicates a successful response
  if (request.status >= 200 && request.status < 400) {
    // Parse JSON response text into a JavaScript object
    var data = JSON.parse(request.responseText)

    // Sort data.results array by Pokemon number
    data.results.sort((a, b) => {
      const numberA = parseInt(a.url.split('/').slice(-2, -1))
      const numberB = parseInt(b.url.split('/').slice(-2, -1))
      return numberA - numberB
    })

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
              const typeImageContainer = document.createElement ('div')
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
    errorMessage.textContent = 'Meowth: `tell me your tale of failure again`'
    app.appendChild(errorMessage)
  }
}

// Function to get the description from pokemonDetails
function getPokemonDescription(pokemonDetails) {
  // Check for the presence of required properties at each level
  if (
    pokemonDetails.flavor_text_entries &&
    pokemonDetails.flavor_text_entries.length > 0
  ) {
    const englishDescription = pokemonDetails.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    );
    if (englishDescription) {
      return englishDescription.flavor_text
    }
  }
  return "Description not available"
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

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stats',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
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
