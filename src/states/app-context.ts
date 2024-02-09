import { observable, computed, action, flow } from "mobx"
import type { Application } from "pixi.js"
import type { Socket } from "socket.io-client";
import { Character } from "../classes/character";

class AppContext {
    private pixiApp!:Application<HTMLCanvasElement>;
    private socketInstance!: Socket
    private protagonist!: Character
    private nameTag!: string

    constructor() {}

    public setPixiApplication(app:Application<HTMLCanvasElement>){
        console.log("[Trace]: Pixi Application has been stored into AppContext")
        this.pixiApp = app
    }

    public setSocketInstance(s: Socket){
        console.log("[Trace]: Socket has been stored into AppContext")
        this.socketInstance = s
    }

    public setProtagonist(p: Character){
        console.log("[Trace]: Protagonist has been stored into AppContext")
        this.protagonist = p
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
}

export default new AppContext()