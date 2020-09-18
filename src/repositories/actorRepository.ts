import { Actor } from "../models/actor";

// The repositories handle the actual "database" calls
export class ActorRepository {
    private actors: Actor[] = [];

    public add(actor: Actor) {
        this.actors.push(actor);

        return actor;
    }

    // Since actors cannot have the same name as other actors, this should be unique
    public findByName(name: string) {
        const actor = this.actors.find((actor) => actor.name === name);

        return actor;
    }
}
