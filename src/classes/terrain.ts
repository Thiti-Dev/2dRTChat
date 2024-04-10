import { Assets, Container, Sprite, Text, TextStyle, Texture } from "pixi.js"
import appContext from "../states/app-context"

export type AvailableTerrainModel = "tree8" |"tree9" |"tree10" | "tree11" | "bench1" | "bench2"| "bush1" | "bush2" | "bush3" | "rock1"

const AssetsConfiguration: Partial<Record<AvailableTerrainModel,{width:number,height:number,yDef:number}>> = {
    bush1:{width: 300,height:300,yDef: 530},
    bush2:{width: 300,height:300,yDef: 530},
    bush3:{width: 600,height:200,yDef: 530},
    tree8:{width: 500,height:600,yDef: 300},
    tree9:{width: 500,height:600,yDef: 300},
    tree10:{width: 500,height:600,yDef: 300},
    tree11:{width: 500,height:600,yDef: 380},
    bench2:{width: 500,height:500,yDef: 400},
    bench1:{width: 450,height:300,yDef: 450}
}

const contributionLabelStyle = new TextStyle({
    fontFamily: 'Courier New',
    dropShadow: true,
    dropShadowAlpha: 0.8,
    dropShadowAngle: 2.1,
    dropShadowBlur: 4,
    dropShadowColor: '0x111111',
    dropShadowDistance: 2,
    fill: ['#FBFF05'],
    stroke: '#000000',
    fontSize: 14,
    fontWeight: 'lighter',
    lineJoin: 'round',
    strokeThickness: 5,
});

export class Terrain{
    private terrainType: 'tree' = 'tree' // default tree type
    private sprite!: Sprite
    private container!: Container
    constructor(private terrainModel: AvailableTerrainModel, private timestamp?: string){
        this.createTerrainSprite() // create sprite
    }

    public createTerrainSprite(){
        const container = new Container()
        const texture = Assets.cache.get(`./assets/${this.terrainModel}.png`) as Texture
        const sprite = Sprite.from(texture.clone())
        sprite.anchor.set(0.5)

        let yPos:number,width:number,height:number
        if(AssetsConfiguration.hasOwnProperty(this.terrainModel)){
            yPos = AssetsConfiguration[this.terrainModel]!.yDef
            width = AssetsConfiguration[this.terrainModel]!.width
            height = AssetsConfiguration[this.terrainModel]!.height
        }else{
            yPos = 400
            width = 500
            height = 500
        }

        sprite.width = width
        sprite.height = height
        container.addChild(sprite)
        container.zIndex = 1


        // if timestamp presents, terrain is being created by contribution count process
        if(this.timestamp){
            const tag = new Text("🔨: " + this.timestamp,contributionLabelStyle);
            tag.anchor.set(0.5)
            container.addChild(tag)   
        }

        this.sprite = sprite
        this.container = container
    }

    public spawnToScene(app: Container,x:number,y?:number){
        this.container.position.set(x,y ?? AssetsConfiguration[this.terrainModel]?.yDef ?? 400)
        appContext.getWorldContainer().addChild(this.container)
    }
}