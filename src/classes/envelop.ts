import { Application, Assets, Container, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { SERVICE_API } from "../shared/constants/variables"
import { IEnvelop } from "../shared/types/envelops.type";
import appContext from "../states/app-context";
import { sleep } from "../utils/common";

import Swal from 'sweetalert2'

export class Envelop{
    public id!: string; 
    public message!: string;
    public fromWho!: string;
    public sprite!: Sprite;
    public container!: Container;
    public static envelops: Envelop[] = []
    public static isModelCurrentlyOpened = false

    constructor(id:string,message: string, fromWho:string){
        this.message = message
        this.fromWho = fromWho
        this.createSprite()
        Envelop.envelops.push(this)
    }

    public static async createEnvelop(message:string){
        const {x,y} = appContext.getProtagonistCharacter().getContainer()
        return fetch(`${SERVICE_API}/envelops/create`,{headers:{
            "content-type": "application/json"
        },method:"POST",body: JSON.stringify({
            message,
            from_who: appContext.getProtagonistCharacter().name,
            pos_x: x,
            pos_y: y
        })})
    }

    public static subscribeToNewEnvelopCreated(){
        const eventSource = new EventSource(`${SERVICE_API}/envelops/subscribe`);

        eventSource.addEventListener('message', (event) => {
            const data = JSON.parse(event.data) as {newly_added_envelop: IEnvelop}
            if(!data.newly_added_envelop) return // ignore invalid format of data
            const envelop = data.newly_added_envelop
            const object = new Envelop(envelop.id,envelop.message, envelop.from_who)
            object.spawnToScene(envelop.pos_x,envelop.pos_y)
          });
    }

    public static registerTicker(app:Application<HTMLCanvasElement>){
        const labelStyle = new TextStyle({
            fontFamily: 'Courier New',
            dropShadow: true,
            dropShadowAlpha: 0.8,
            dropShadowAngle: 2.1,
            dropShadowBlur: 4,
            dropShadowColor: '0x111111',
            dropShadowDistance: 2,
            fill: ['#FFFFFF'],
            stroke: '#000000',
            fontSize: 14,
            fontWeight: 'lighter',
            lineJoin: 'round',
            strokeThickness: 5,
        });

        const helperText = new Text("(E) to read",labelStyle);
        helperText.visible = false
        helperText.anchor.set(0.5,3)
        helperText.zIndex = 997.5;
        appContext.getWorldContainer().addChild(helperText)
        app.ticker.add(async(delta) => {
            const proximatedEnvelop = this.getClosestEnvelopInRange(100)
            if(proximatedEnvelop){
                if(!helperText.visible || (helperText.x !== proximatedEnvelop.container.x && helperText.y !== proximatedEnvelop.container.y)){
                    helperText.x = proximatedEnvelop.container.x
                    helperText.y = proximatedEnvelop.container.y + 20
                    helperText.visible = true
                }
            }else if(helperText.visible && !proximatedEnvelop){
                helperText.visible = false
            }
            await sleep(1000)
        })

        window.addEventListener("keyup", (event) => {
            if(this.isModelCurrentlyOpened) return
            if(event.key === 'f'){
                const proximatedEnvelop = this.getClosestEnvelopInRange(50)
                if(proximatedEnvelop){
                    return Swal.fire({
                        title: "Warning",
                        html: "Don't stack up the envelop, move a bit further . . .",
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                      })
                }
                

                this.isModelCurrentlyOpened = true
                Swal.fire({
                    title: "What message you wanna leave for Thiti-Dev",
                    input: "text",
                    inputAttributes: {
                      autocapitalize: "off"
                    },
                    width: "50%",
                    confirmButtonText: "Leave message",
                    showCancelButton:true,
                    showLoaderOnConfirm: true,
                    preConfirm: async (input) => {
                        const envelop = await this.createEnvelop(input)
                        if(!envelop.ok){
                            return Swal.showValidationMessage(`
                            Failed leaving note for Thiti-Dev
                        `);
                        }
                        return (await envelop.json())

                    },
                    willClose: () => {
                        this.isModelCurrentlyOpened = false
                    }
                }).then((envelop) => {
                    console.log(envelop)
                })

            }else if(event.key === 'e'){
                const proximatedEnvelop = this.getClosestEnvelopInRange(100)
                if(proximatedEnvelop){
                    this.isModelCurrentlyOpened = true
                    Swal.fire({
                        title: "From " + proximatedEnvelop.fromWho,
                        width: 600,
                        padding: "5px",
                        color: "#000000",
                        html: `<h3>${proximatedEnvelop.message}</h3>`,
                        background: "#fff url(./assets/blank-paper.jpeg) no-repeat",
                        showConfirmButton: false,
                        willClose: () => {
                            this.isModelCurrentlyOpened = false
                        }
                      });
                }
            }
        })
    }

    public static getClosestEnvelopInRange(range: number): Envelop | null{
        const characterXPos = appContext.getProtagonistCharacter().getContainer().x
        let lowestRange = Number.MAX_SAFE_INTEGER, closestEnvelop: Envelop| null = null
        for(const envelop of this.envelops){
            const distance = Math.abs(characterXPos - envelop.container.x)
            if(distance <= range && lowestRange >= distance){
                closestEnvelop = envelop
                lowestRange = distance
            }
        }
        return closestEnvelop
    }

    public static async getEnvelops(){
        return fetch(`${SERVICE_API}/envelops`,{method:"GET"})
    }
    public static async getAndCreateEnvelops(){
        const envelopResponse = await this.getEnvelops()
        if(!envelopResponse.ok) return
        const envelops = await envelopResponse.json() as IEnvelop[]
        envelops.forEach((envelop) => {
            const object = new Envelop(envelop.id,envelop.message, envelop.from_who)
            object.spawnToScene(envelop.pos_x,envelop.pos_y)
        })
    }

    public createSprite(){
        const container = new Container()
        const texture = Assets.cache.get(`./assets/envelop.png`) as Texture
        const sprite = Sprite.from(texture.clone())
        sprite.anchor.set(0.5)
        sprite.width = 60
        sprite.height = 30

        container.addChild(sprite)
        container.zIndex = 997 // behind main&prior character

        this.sprite = sprite
        this.container = container
    }

    public spawnToScene(x:number,y?:number){
        this.container.position.set(x,(y ?? 530) + 60)
        appContext.getWorldContainer().addChild(this.container)
    }
}