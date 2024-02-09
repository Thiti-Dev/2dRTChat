import { Socket } from "socket.io-client"
import { Character } from "../classes/character"
import { VOIP_OUT_OF_RANGE_DISTANCE } from "../shared/constants/config"
import { PlayerData, PlayerPositioningUpdatePayload } from "../shared/types"
import appContext from "./app-context"

export class Players{
    private playerDatas: Record<string,PlayerData> = {}
    private mappedAudioElementBySocketID: Record<string,HTMLAudioElement> = {}
    constructor() {}

    public positioningEventHandler(stringifiedData: string){
        const data = JSON.parse(stringifiedData) as PlayerPositioningUpdatePayload
        if(data.type !== 'pos_update') return
        if(!this.playerDatas.hasOwnProperty(data.id)) return
    
        this.playerDatas[data.id].character.setPosition(data.x,data.y)
    
        // Volume adjustment based on how faraway this player from protagonist
        if(!this.mappedAudioElementBySocketID.hasOwnProperty(data.id)) return
    
        const {x: px} = appContext.getProtagonistCharacter().getContainer()
        const diffDistance = Math.abs(Math.abs(px) - Math.abs(data.x))

        if(diffDistance > VOIP_OUT_OF_RANGE_DISTANCE){
            this.mappedAudioElementBySocketID[data.id].volume = 0
        }else{
            this.mappedAudioElementBySocketID[data.id].volume = ((((VOIP_OUT_OF_RANGE_DISTANCE- diffDistance)/VOIP_OUT_OF_RANGE_DISTANCE) * 100) / 100) / 100
        }
    }

    // Spawn online player which is currently in the RTC mesh
    public spawnSyncedPlayer(id:string,who:string){
        const app = appContext.getPixiApplication()
        const world = appContext.getWorldContainer()

        const playerCharacter = new Character(who)
        playerCharacter.registerCustomTicker(app)
        playerCharacter.spawnToScene(world,70,530)
        this.playerDatas[id] = {
            name: who,
            position:{x:70,y:530},
            character:playerCharacter
        }

        setTimeout(() => {
            appContext.getSocketInstance().emit("req sync")
        }, 1000); // Delay Timer needed to get the RTC state to be ready otherwise would get data-channel error as we can't send the msg to channels yet
    }

    // Called when get the disconnection notify
    public removePlayer(id:string){
        if(!this.playerDatas.hasOwnProperty(id)) return
        this.playerDatas[id].character.remove()
    }

    public registerAudioElementForPlayer(id:string,audioElement: HTMLAudioElement){
        this.mappedAudioElementBySocketID[id] = audioElement
    }

    public protagonistMovementNotify(px: number){
        for(const socketID in this.playerDatas){
            if(!this.mappedAudioElementBySocketID.hasOwnProperty(socketID)) continue
            const player = this.playerDatas[socketID]
            const diffDistance = Math.abs(px - player.character.getContainer().position.x)


            if(diffDistance > VOIP_OUT_OF_RANGE_DISTANCE){
                this.mappedAudioElementBySocketID[socketID].volume = 0
            }else{
                this.mappedAudioElementBySocketID[socketID].volume =( (((VOIP_OUT_OF_RANGE_DISTANCE- diffDistance)/VOIP_OUT_OF_RANGE_DISTANCE) * 100) / 100) / 100
            }
        }
    }

    public setupSocketEventHandler(socket:Socket){
        socket.on("req sync",  (requesterID:string) => {
            appContext.getProtagonistCharacter().positioningPlayerBasedOnMovingFactor(true) // broadcast position to all peers
        })
    }
}

export default new Players()