import { observable, computed, action, flow } from "mobx"
import type { Application, Container } from "pixi.js"
import type { Socket } from "socket.io-client";
import { Character } from "../classes/character";
import world from "./world";

class AppContext {
    private pixiApp!:Application<HTMLCanvasElement>;
    private socketInstance!: Socket
    private protagonist!: Character
    private nameTag!: string
    private worldContainer!: Container

    constructor() {}

    public setPixiApplication(app:Application<HTMLCanvasElement>,worldC: Container){
        console.log("[Trace]: Pixi Application & World has been stored into AppContext")
        this.pixiApp = app
        this.worldContainer = worldC

    }

    public setSocketInstance(s: Socket){
        console.log("[Trace]: Socket has been stored into AppContext")
        this.socketInstance = s
    }

    public setProtagonist(p: Character){
        console.log("[Trace]: Protagonist has been stored into AppContext")
        this.protagonist = p

        // After setting up protagonist -> create world ticker to dynamically slide the tilingBackground when moves to edges
        world.setupWorldUpdateTickerHandler(this.pixiApp, this.worldContainer, p)
    }


    public setNameTag(tag: string){
        this.nameTag = tag
    }

    @computed
    public getPixiApplication(): Application<HTMLCanvasElement>{
        return this.pixiApp
    }

    @computed
    public getSocketInstance(): Socket{
        return this.socketInstance
    }

    @computed
    public getProtagonistCharacter(): Character{
        return this.protagonist
    }

    @computed
    public getNameTag(): string{
        return this.nameTag
    }

    @computed
    public getWorldContainer(): Container{
        return this.worldContainer
    }
}

export default new AppContext()