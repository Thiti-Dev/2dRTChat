import { Character } from "../classes/character"
import type { PlayerPositioningUpdatePayload } from "../shared/types"
import appContext from "../states/app-context"

type PlayerData = {
    name: string
    position: {x:number,y:number}
    character: Character
}

const PlayerDatas: Record<string,PlayerData> = {}

// Handler when pos_update from data-channel received
export function positioningEventHandler(stringifiedData: string){
    const data = JSON.parse(stringifiedData) as PlayerPositioningUpdatePayload
    if(data.type !== 'pos_update') return
    if(!PlayerDatas.hasOwnProperty(data.id)) return

    PlayerDatas[data.id].character.setPosition(data.x,data.y)
}

// Spawn online player which is currently in the RTC mesh
export function spawnSyncedPlayer(id:string,who:string){
    const app = appContext.getPixiApplication()
    const world = appContext.getWorldContainer()

    const playerCharacter = new Character(who)
    playerCharacter.registerCustomTicker(app)
    playerCharacter.spawnToScene(world,90,530)
    PlayerDatas[id] = {
        name: who,
        position:{x:90,y:530},
        character:playerCharacter
    }
}

// Called when get the disconnection notify
export function removePlayer(id:string){
    if(!PlayerDatas.hasOwnProperty(id)) return
    PlayerDatas[id].character.remove()
}