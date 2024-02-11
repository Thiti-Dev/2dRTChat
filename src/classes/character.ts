import { AnimatedSprite, Application, Assets, Container, DisplayObject, Sprite, Text, TextStyle } from "pixi.js";
import { broadCastDataToPeers, pushToTalk } from "../core/voice-chat";
import type { PlayerPositioningUpdatePayload } from "../shared/types";
import appContext from "../states/app-context";
import players from "../states/players";
import { isAbsoluteNumber } from "../utils/maths/is-absolute-number";

export class Character{
    private sprite!: AnimatedSprite;
    private movingFactor = 0;
    private hasJustGoneLeftDirection = false
    private container!:Container<DisplayObject>
    private alreadyHasGoneLeft = false
    private socketID: string|null = null
    private nameTag:Text| null  = null
    private isProtagonist: boolean = false
    private hasBroadcastedDormantStateOnce: boolean = false
    constructor(private name: string,protagonist: boolean = false){
        console.log(`Character: ${name} has been initiated`)
        //this.setSprite(Sprite.from('https://pixijs.com/assets/flowerTop.png'))
        this.animatedSpriteBuilder()
        this.isProtagonist = protagonist
    }

    private getSocketID(){
        if(!this.socketID) this.socketID = appContext.getSocketInstance().id!
        return this.socketID
    }

    private animatedSpriteBuilder(){
        const animations = Assets.cache.get("./assets/sheets/c1.json").data.animations;
        // create an animated sprite
        const character = AnimatedSprite.fromFrames(animations["walk"]);
        character.anchor.set(0.5)
        character.width = 250
        character.height = 250
        character.animationSpeed = 1 / 6; // 6 fps
        character.gotoAndStop(3)
        
        this.sprite = character
    }

    // public setSprite(sprite: Sprite){
    //     sprite.anchor.set(0.5)
    //     this.sprite = sprite
    // }

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
            dropShadowDistance: 2,
            fill: ['#ffffff'],
            stroke: '#000000',
            fontSize: 18,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 5,
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

            if(!this.isProtagonist) return
            this.positioningPlayerBasedOnMovingFactor()
        });
    }

    public positioningPlayerBasedOnMovingFactor(syncRequst: boolean = false){

        if(syncRequst) return broadCastDataToPeers({id:this.getSocketID(),type:'pos_update',x: this.container.x,y:this.container.y,isDormant:true,directionHeading: this.getCurrentDirectionHeading()} as PlayerPositioningUpdatePayload)

        const movingFactor = this.movingFactor 
        if(movingFactor !== 0){
            this.container.x+=movingFactor
            broadCastDataToPeers({id:this.getSocketID(),type:'pos_update',x: this.container.x,y:this.container.y,directionHeading:this.getCurrentDirectionHeading()} as PlayerPositioningUpdatePayload)
            this.hasBroadcastedDormantStateOnce = false
            players.protagonistMovementNotify(this.container.x)

            // playing animation if it's currently moving
            if(!this.sprite.playing){
                this.sprite.play()
            }
        }
        else{
            if(this.sprite.playing) this.sprite.gotoAndStop(3)
            if(!this.hasBroadcastedDormantStateOnce){
                this.hasBroadcastedDormantStateOnce = true
                broadCastDataToPeers({id:this.getSocketID(),type:'pos_update',x: this.container.x,y:this.container.y,isDormant:true,directionHeading:this.getCurrentDirectionHeading()} as PlayerPositioningUpdatePayload)
            }
        }

        if(movingFactor === -2 && this.sprite.scale.x > 0){
            this.sprite.scale.x = -this.sprite.scale.x;
        }else if(movingFactor === 2 && this.sprite.scale.x < 0){
            this.sprite.scale.x = Math.abs(this.sprite.scale.x)
        }
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

            if(event.key === 'v'){
                // push to talk . . .
                pushToTalk(true) // spamming safe (spamable)
            }
            event.preventDefault();
        }, false);

        window.addEventListener("keyup", (event) => {
            if(event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
                this.movingFactor = 0
            }
            if(event.key === 'v'){
                // push to talk . . .
                pushToTalk(false)
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
        this.name = name // persist
        if(!this.nameTag) return
        this.nameTag.text = name
    }

    public setTalkingState(talk: boolean){
        if(!this.nameTag) return
        this.nameTag.text = talk ? `${this.name} 🔊` : this.name
    }

    public getContainer(): Container{
        return this.container
    }

    public getSprite(): AnimatedSprite{
        return this.sprite
    }

    public getCurrentDirectionHeading(): PlayerPositioningUpdatePayload['directionHeading']{
        if(isAbsoluteNumber(this.sprite.scale.x)) return 'RIGHT'
        return 'LEFT'

    }
}