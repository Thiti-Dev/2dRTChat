import { AvailableTerrainModel, Terrain } from "../../classes/terrain";
import { RefinedContributionData } from "../../shared/types/contribution.types";
import appContext from "../../states/app-context";

const mappedTerrainModelByContributionCount: Record<number,AvailableTerrainModel> = {
    0: "bush1",
    1: "bush2",
    2: "bush2",
    3: "bush3",
    4: "bush3",
    5: "bench1",
    6: "bench1",
    7: "tree8",
    8: "tree8",
    9: "tree8",
    10: "tree8",
    11: "tree9",
    12: "tree9",
    13: "tree9",
    14: "tree9",
    15: "tree10",
    16: "tree10",
    17: "tree10",
    18: "tree10",
    19: "tree10",
    20: "tree11",
    21: "tree11",
    22: "tree11",
    23: "tree11",
    24: "tree11",
    25: "rock1",
    26: "rock1",
    27: "rock1",
    28: "rock1",
    29: "rock1",
}


export const getAvailableTerrainAssets: () => AvailableTerrainModel[] = () => ["bench1", "bench2", "tree8", "tree9","tree10", "tree11","rock1", "bush1", "bush2", "bush3"]
export function terrainAssetNamesToActualFileTakenPlace(){
    return getAvailableTerrainAssets().map((tname) => `./assets/${tname}.png`)
}

export function fromContributionsDataToTerrains(contributionsData: RefinedContributionData[]){
    const worldContainer = appContext.getWorldContainer()
    const terrains = contributionsData.map((data,index) => {
        let terrainModel: AvailableTerrainModel
        if(data.count < 30){
            terrainModel = mappedTerrainModelByContributionCount[data.count]
        }else{
            terrainModel = 'bench2'
        }

        const terrain = new Terrain(terrainModel,data.date)
        //terrain.spawnToScene(worldContainer, 70 - ((index+1) * 500))
        return terrain
    })

    terrains.slice(0, Math.floor(terrains.length/2)).reverse().forEach((terrain,index) => {
        terrain.spawnToScene(worldContainer, 70 + ((index+1) * 500))
        return terrain
    })

    terrains.slice(Math.floor(terrains.length/2)).forEach((terrain,index) => {
        terrain.spawnToScene(worldContainer, 70 - ((index+1) * 500))
        return terrain
    })
}