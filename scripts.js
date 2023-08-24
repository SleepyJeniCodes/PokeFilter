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

          // Display Pokemon types in p
          const typeParagraph = document.createElement('p')
          typeParagraph.textContent = `Type(s): ${pokemonDetails.types.map(type => type.type.name).join(' | ')}`

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

              // Append the elements to the container element
              container.appendChild(card)
              card.appendChild(h1)
              card.appendChild(img)
              card.appendChild(typeParagraph)
              card.appendChild(p)
            })
            .catch((error) => {
              console.error('Error fetching species details', error)
            })
        })
        .catch((error) => {
          console.error('Error fetching Pokémon details', error);
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

// Send the request
request.send()