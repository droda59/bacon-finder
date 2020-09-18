import { Movie } from "../models/movie";

// The repositories handle the actual "database" calls
export class MovieRepository {
    private movies: Movie[] = [];

    public add(movie: Movie) {
        this.movies.push(movie);

        return movie;
    }

    public findById(id: string) {
        const movie = this.movies.find((movie) => movie.id === id);

        return movie;
    }
}
