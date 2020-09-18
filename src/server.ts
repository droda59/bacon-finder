import express, { Express } from "express";
import bodyParser from "body-parser";
import { BaconRouter } from "./routers/baconRouter";
import { ActorRepository } from "./repositories/actorRepository";
import * as csv from "fast-csv";
import { MovieRepository } from "./repositories/movieRepository";
import { Movie } from "./models/movie";
import { Actor } from "./models/actor";

class Server {
    private app: Express;
    private baconRouter: BaconRouter;
    private actorRepository: ActorRepository;
    private movieRepository: MovieRepository;

    constructor() {
        this.actorRepository = new ActorRepository();
        this.movieRepository = new MovieRepository();
        this.baconRouter = new BaconRouter(this.actorRepository);
        this.baconRouter.init();

        this.app = express();
        this.config();
        this.routerConfig();
        this.initData();
    }

    private config() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    private routerConfig() {
        this.app.use("/bacon", this.baconRouter.router);
    }

    private softEval(string: string, escape: any = []) {
        if (!string) {
            return escape;
        }

        try {
            return eval(string);
        } catch (e) {
            return escape;
        }
    }

    // This is not useful in the current version, but it could very well be if we want to know the Way to Kevin Bacon
    // e.g. Michael Papajohn (The Dark Knight Rises) -> Gary Oldman (Murder in the First) -> Kevin Bacon
    private processMovieRow(row: any, movieRepository: MovieRepository) {
        const movie = new Movie(row.id, row.original_title);
        movieRepository.add(movie);
    }

    private processCreditsRow(
        row: any,
        movieRepository: MovieRepository,
        actorRepository: ActorRepository
    ) {
        let movie = movieRepository.findById(row.id);
        if (!movie) {
            throw new Error("Cannot find movie");
        }

        const castData = this.softEval(row.cast) as any[];

        for (let i = 0; i < castData.length; i++) {
            const castMember = castData[i];
            let actor = actorRepository.findByName(castMember.name);
            if (!actor) {
                actor = new Actor(castMember.id, castMember.name);
                actorRepository.add(actor);
            }

            actor.movies.push(movie);
            movie.cast.push(actor);
        }
    }

    private initData() {
        console.log("Initializing data");
        const fs = require("fs");

        console.log("Processing Movies...");
        fs.createReadStream("data/movies_metadata.csv")
            .pipe(csv.parse({ headers: true }))
            .on("data", (data: any) =>
                this.processMovieRow(data, this.movieRepository)
            )
            .on("end", () => {
                console.log("Done processing movies");
                console.log("Processing actors...");
                let done = false;

                // Broke down the file in two parts because it was too big for Git
                // Also having two smaller files in parallel makes it faster
                const castPart1Promise = new Promise((resolve) =>
                    fs
                        .createReadStream("data/credits1.csv")
                        .pipe(csv.parse({ headers: true }))
                        .on("data", (data: any) =>
                            this.processCreditsRow(
                                data,
                                this.movieRepository,
                                this.actorRepository
                            )
                        )
                        .on("end", () => resolve())
                );

                const castPart2Promise = new Promise((resolve) =>
                    fs
                        .createReadStream("data/credits2.csv")
                        .pipe(csv.parse({ headers: true }))
                        .on("data", (data: any) =>
                            this.processCreditsRow(
                                data,
                                this.movieRepository,
                                this.actorRepository
                            )
                        )
                        .on("end", () => resolve())
                );

                Promise.all([castPart1Promise, castPart2Promise]).then(() => {
                    done = true;
                    console.log("Done processing actors");
                    console.log("Ready to go!");
                });
            });
    }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            this.app
                .listen(port, () => {
                    resolve(port);
                })
                .on("error", (err: Object) => reject(err));
        });
    };
}

export default Server;
