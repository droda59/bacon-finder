import { Request, Response } from "express";
import { ActorRepository } from "../repositories/actorRepository";
import { Actor } from "../models/actor";

// The Controllers handle the request and do the processing
export class BaconController {
    private actorRepository: ActorRepository;

    constructor(actorRepository: ActorRepository) {
        this.actorRepository = actorRepository;
    }

    public get(req: Request, res: Response) {
        try {
            const queryActor = req.query.actor as string;
            if (!queryActor) {
                return res.status(400).json("Need to enter an actor name");
            }

            // TODO Receive this as query string if we want to check between two actors instead
            // TODO Uppercase it to make the search more user-friendly;
            // however this is more heavy on the processing since all names have to be capitalized
            const originalBaconName = "Kevin Bacon";

            // We could optimize and return without making any calls if we're looking for Kevin Bacon himself,
            // but we would have different return paths and thus not necessarily clean code
            let actor = this.actorRepository.findByName(queryActor);
            if (!actor) {
                return res.status(404).json("Actor not found");
            }

            const checkedMovies = new Set<string>();
            const checkedActors = new Set<string>();

            let baconLevel = 0;
            let found = originalBaconName === actor.name;
            let currentLevelActors = [actor];

            while (!found) {
                baconLevel++;

                let currentLevelCostars: Actor[] = [];
                currentLevelActors.forEach((currentLevelActor) => {
                    if (!checkedActors.has(currentLevelActor.name)) {
                        const costars = this.getActorUncheckedCostars(
                            currentLevelActor,
                            checkedMovies,
                            checkedActors
                        );

                        currentLevelCostars = currentLevelCostars.concat(
                            costars
                        );
                        checkedActors.add(currentLevelActor.name);
                    }
                });

                const baconLevelSet = new Set(
                    currentLevelCostars.map((costar) => costar.name)
                );

                found = baconLevelSet.has(originalBaconName);
                currentLevelActors = currentLevelCostars;
            }

            console.log("Found", queryActor, "in level", baconLevel);

            res.json(baconLevel);
        } catch (error) {
            console.log(error);
            res.status(400).json(error);
        }
    }

    // // Returns an array of all of an actor's different costars
    // private getActorCostars(actor: Actor): Actor[] {
    //     let currentActorCostars: Actor[] = [];

    //     // Check all the actor's movies
    //     actor.movies.forEach(movie => {
    //         currentActorCostars = currentActorCostars.concat(movie.cast);
    //     });

    //     // Return the costars excluding the actor we're investigating
    //     return currentActorCostars.filter(costar => costar.name !== actor.name);
    // }

    // Returns an array of all of an actor's different costars that were not previously checked
    // This function is less heavy that the previous one because it doesn't keep in memory movies and actor that would have already been checked
    private getActorUncheckedCostars(
        actor: Actor,
        checkedMovies: Set<string>,
        checkedActors: Set<string>
    ): Actor[] {
        let currentActorCostars: Actor[] = [];

        // Check all the actor's movies except the ones we already checked
        actor.movies.forEach((movie) => {
            // The movie might already have been investigated
            if (!checkedMovies.has(movie.id)) {
                currentActorCostars = currentActorCostars.concat(movie.cast);
                checkedMovies.add(movie.id);
            }
        });

        // Return the costars excluding the actor we're investigating or ones we alredy checked
        const distinctCostars: Actor[] = [];
        currentActorCostars.forEach((costar) => {
            if (costar.name !== actor.name && !checkedActors.has(costar.name)) {
                distinctCostars.push(costar);
            }
        });

        return distinctCostars;
    }
}
