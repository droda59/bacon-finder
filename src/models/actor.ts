import { Movie } from "./movie";

export class Actor {
    private id: string;
    public name: string;
    public movies: Movie[];

    constructor(id: string, name: string, movies: Movie[] = []) {
        this.id = id;
        this.name = name;
        this.movies = movies;
    }
}
