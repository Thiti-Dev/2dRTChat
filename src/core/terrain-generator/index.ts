import { AvailableTerrainModel, Terrain } from "../../classes/terrain";
import { RefinedContributionData } from "../../shared/types/contribution.types";
import appContext from "../../states/app-context";

export const getAvailableTerrainAssets: () => AvailableTerrainModel[] = () => ["bench1", "bench2", "tree8", "tree9","tree10", "tree11","rock1", "bush1", "bush2", "bush3"]
export function terrainAssetNamesToActualFileTakenPlace(){
    return getAvailableTerrainAssets().map((tname) => `./assets/${tname}.png`)
}

export function fromContributionsDataToTerrains(contributionsData: RefinedContributionData[]){
    const worldContainer = appContext.getWorldContainer()
    return contributionsData.map((data,index) => {
        const terrains: AvailableTerrainModel[]  = getAvailableTerrainAssets()
        const randomIndex = Math.floor(Math.random() * terrains.length)
        const terrain = new Terrain(terrains[randomIndex])
        terrain.spawnToScene(worldContainer, 70 - ((index+1) * 500))
        return terrain
    })
}