import z from 'zod'

const movieSchema = z.object({
        title: z.string({ required_error: 'Title is required', invalid_type_error: 'Title must be a string' }).min(1),
        year: z.number({ required_error: 'Year is required' }).min(1888).int(),
        director: z.string({ required_error: 'Director is required' }),
        duration: z.number({ required_error: 'Duration is required' }).positive(),
        poster: z.string({ required_error: 'Poster is required' }).url({ message: 'Poster must be a valid URL' }),
        genre: z.enum(['Adventure','Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'], { required_error: 'Genre is required' }).array().min(1),
        rate: z.number().min(0).max(10).optional()
    })

function validateMovie(object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie(object) {
    return movieSchema.partial().safeParse(object)
}

export { validateMovie, validatePartialMovie }