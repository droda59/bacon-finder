import { Request, Response, Router } from "express";

import { BaconController } from "../controllers/baconController";
import { ActorRepository } from "../repositories/actorRepository";

export class BaconRouter {
    public router: Router;

    private baconController: BaconController;

    constructor(actorRepository: ActorRepository) {
        this.router = Router();

        this.baconController = new BaconController(actorRepository);
    }

    public init() {
        this.router.get("/", (request: Request, response: Response) => {
            this.baconController.get(request, response);
        });
    }
}
