import { Application, Container, TilingSprite } from "pixi.js";
import { observable, computed, action, flow } from "mobx"
import { Character } from "../classes/character";
import {gsap} from "gsap";
import { CANVAS_SIZE } from "../shared/constants/config";
export class World{
    private backgroundSprite!: TilingSprite;
    private isWorldPivoting: boolean = false
    private pivotedStageHistory = CANVAS_SIZE.WIDTH
    constructor(){}

    public setupWorldUpdateTickerHandler(app:Application<HTMLCanvasElement>,worldContainer: Container, protagonist: Character){
        const protagonistContainer = protagonist.getContainer()
        app.ticker.add((delta) => {
            if(this.isWorldPivoting) return
           const {x,y} = protagonistContainer.position
           const pivotStage = this.pivotedStageHistory
    

           if(x < (pivotStage - CANVAS_SIZE.WIDTH)){
                console.log("[World]: Pivoting the world to the left")
                this.isWorldPivoting = true
                this.pivotedStageHistory-=CANVAS_SIZE.WIDTH;
                gsap.to(worldContainer.position, {x: worldContainer.position.x+CANVAS_SIZE.WIDTH,duration: 2,ease:'power2.out'})
                gsap.to(this.backgroundSprite.tilePosition, { x: this.backgroundSprite.tilePosition.x+CANVAS_SIZE.WIDTH, duration: 2, ease: "power2.out" }).then(() => this.isWorldPivoting = false)
           }else if(x > ((pivotStage - CANVAS_SIZE.WIDTH) + CANVAS_SIZE.WIDTH)){ // because i set the default pivot = CANVAS_SIZE.WIDTH, so here is a bit messy condition presented
                console.log("Pivoting the world to the right")
                this.isWorldPivoting = true
                this.pivotedStageHistory+=CANVAS_SIZE.WIDTH;
                gsap.to(worldContainer.position, {x: worldContainer.position.x-CANVAS_SIZE.WIDTH,duration: 2,ease:'power2.out'})
                gsap.to(this.backgroundSprite.tilePosition, { x: this.backgroundSprite.tilePosition.x-CANVAS_SIZE.WIDTH, duration: 2, ease: "power2.out" }).then(() => this.isWorldPivoting = false)
            }
        })
    }

    public setTilingBackgroundSprite(t: TilingSprite){
        this.backgroundSprite = t
    }

    @computed
    public getTilingBackgroundSprite(): TilingSprite{
        return this.backgroundSprite
    }
}

export default new World()