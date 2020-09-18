import { Actor } from "./actor";

export class Movie {
    public id: string;
    public title: string;
    public cast: Actor[];

    constructor(id: string, title: string, cast: Actor[] = []) {
        this.id = id;
        this.title = title;
        this.cast = cast;
    }
}
