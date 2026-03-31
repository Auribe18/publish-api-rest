import express from 'express'
import crypto from 'node:crypto'
import { movies } from './data/movies.mjs'
import { validateMovie, validatePartialMovie } from './schemas/movies.mjs'
const app = express()

app.disable('x-powered-by') // Deshabilitar la cabecera 'X-Powered-By' por seguridad

const acceptedOrigins = [
  'http://localhost:8080',
  'http://192.168.1.100:8080',
  'http://192.168.137.1:8080',
  'http://192.168.147.1:8080',
  'http://192.168.150.1:8080',
  'http://172.24.16.1:8080'
]

app.use(express.json()) // Para parsear el cuerpo de las solicitudes como JSON

app.get('/', (req, res) => {
    res.send('<h1>Hola mundo!</h1>')
})

const port = process.env.PORT ?? 3000
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`)
})

app.get('/movies', (req, res) => {
    const origin = req.headers.origin
    console.log('Origin:', origin)
    res.header('Access-Control-Allow-Origin', origin)


    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => { //path-to-regexp
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) {
        res.json(movie)
    } else {
        res.status(404).json({ error: 'Movie not found' })
    }
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    if (!result.success) {
        return res.status(400).json({ errors: JSON.parse(result.error.message) })
    }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex < 0) {
        return res.sendStatus(404).json({ error: 'No se encuentra la película' })
    }
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex] = updateMovie
    res.json(updateMovie)
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
    if (result.error) {
        return res.status(400).json({ errors: JSON.parse(result.error.message) })
    }
    const newMovie = { 
        id: crypto.randomUUID(),
        ...result.data 
    }
    movies.push(newMovie) //Esto no entraría dentro la arquitectura REST, ya que estamos modificando el estado del servidor.
    res.status(201).json(newMovie)
})
