import { Application, Container, DisplayObject, Sprite, Text, TextStyle } from "pixi.js";
import { broadCastDataToPeers } from "../core/voice-chat";
import type { PlayerPositioningUpdatePayload } from "../shared/types";
import appContext from "../states/app-context";

export class Character{
    private sprite!: Sprite;
    private movingFactor = 0;
    private hasJustGoneLeftDirection = false
    private container!:Container<DisplayObject>
    private alreadyHasGoneLeft = false
    private socketID: string|null = null
    private nameTag:Text| null  = null
    constructor(private name: string){
        console.log(`Character: ${name} has been initiated`)
        this.setSprite(Sprite.from('https://pixijs.com/assets/flowerTop.png'))
    }

    private getSocketID(){
        if(!this.socketID) this.socketID = appContext.getSocketInstance().id!
        return this.socketID
    }

    public setSprite(sprite: Sprite){
        sprite.anchor.set(0.5)
        this.sprite = sprite
    }

    public spawnToScene(app: Container,x:number,y:number){
        const container = new Container();
        container.x = x
        container.y = y

        const textStyle = new TextStyle({
            fontFamily: 'Arial',
            dropShadow: true,
            dropShadowAlpha: 0.8,
            dropShadowAngle: 2.1,
            dropShadowBlur: 4,
            dropShadowColor: '0x111111',
            dropShadowDistance: 5,
            fill: ['#ffffff'],
            stroke: '#004620',
            fontSize: 30,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 12,
        });
        const nameTag = new Text(this.name,textStyle);
        
        nameTag.anchor.set(0.5)
        nameTag.y = -120

        container.addChild(this.sprite)
        container.addChild(nameTag)
        app.addChild(container);
        this.nameTag = nameTag
        this.container = container

    }

    public registerCustomTicker(app: Application<HTMLCanvasElement>){
        let scalingFactor = 1
        let isIncrement = true
        app.ticker.add((delta) => {
            if(scalingFactor <= 1.1 && isIncrement){
                scalingFactor+=.0006
            }else{
                scalingFactor-=.0006
                if(scalingFactor <= 1.05){
                    isIncrement = true
                }else isIncrement = false
            }
            this.container.scale.set(scalingFactor);
            
            const movingFactor = this.movingFactor 
            if(movingFactor !== 0){
                this.container.x+=movingFactor
                broadCastDataToPeers({id:this.getSocketID(),type:'pos_update',x: this.container.x,y:this.container.y} as PlayerPositioningUpdatePayload)
            }

            if(movingFactor === -2 && this.sprite.scale.x > 0){
                this.sprite.scale.x = -this.sprite.scale.x;
            }else if(movingFactor === 2 && this.sprite.scale.x < 0){
                this.sprite.scale.x = Math.abs(this.sprite.scale.x)
            }
        });
    }

    public registerMovementListener(){
        window.addEventListener("keydown", (event) => {
            if(event.key === 'ArrowRight'){
                this.movingFactor = 2
                this.hasJustGoneLeftDirection = false
                
            }else if (event.key === 'ArrowLeft'){
                this.movingFactor = -2
                this.hasJustGoneLeftDirection = true
            }
            event.preventDefault();
        }, false);

        window.addEventListener("keyup", (event) => {
            if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
                this.movingFactor = 0
            }
            event.preventDefault();
        }, false);
    }

    public setPosition(x:number,y:number){
        this.container.x = x
        this.container.y = y
    }

    public remove(){
        this.container.removeFromParent()
    }

    public setNameTag(name:string){
        if(!this.nameTag) return
        this.nameTag.text = name
    }

    public getContainer(): Container{
        return this.container
    }
}