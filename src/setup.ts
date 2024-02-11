import { Application, Container, Graphics, Texture, TilingSprite } from "pixi.js";
import { Character } from "./classes/character";
import appContext from "./states/app-context";
import { CANVAS_SIZE } from "./shared/constants/config";
import world from "./states/world";
export async function setupPixiApplication(container: HTMLElement): Promise<{app:Application<HTMLCanvasElement>;worldContainer: Container}>{
    const app = new Application<HTMLCanvasElement>({
        width: container.clientWidth, // Match the width of your div
        height: container.clientHeight, // Match the height of your div
        backgroundColor:  0x1099bb, // Set the background color
    });

    window.addEventListener('resize', () => {
        //CANVAS_SIZE.WIDTH = container.clientWidth // un-comment this later on if you wanna implement the dynamic resizing support
        app.renderer.resize(container.clientWidth, container.clientHeight);
    });

    container.appendChild(app.view);
    addTilingBackgroundImage(app)
    const worldContainer = createWorldContainer(app)
    return {app, worldContainer}
}

function addTilingBackgroundImage(app: Application<HTMLCanvasElement>){

    // const texture = await Assets.load('./assets/bg-image.png');
    // const bgSprite = new Sprite(texture);

    const texture = Texture.from("./assets/bg-image.jpg")
    const tilingSprite = new TilingSprite(
        texture,
        app.screen.width,
        app.screen.height,
    );
    // tilingSprite.scale = {x:1,y:1}
    // tilingSprite.tileScale = {x:1,y:1}
    app.stage.addChild(tilingSprite);
    world.setTilingBackgroundSprite(tilingSprite)
    
}

function createWorldContainer(app: Application<HTMLCanvasElement>):Container{
        const worldContainer = new Container()
        worldContainer.width = CANVAS_SIZE.WIDTH * 100
        worldContainer.height = CANVAS_SIZE.HEIGHT
        app.stage.addChild(worldContainer)
        return worldContainer
}

export function createProtagonist(app: Application<HTMLCanvasElement>,container: Container){
    const protagonist = new Character("Me", true) // Default placeholder name when isn't finished loading -> Me
    protagonist.registerCustomTicker(app)
    protagonist.spawnToScene(container,70,530)
    protagonist.registerMovementListener()

    appContext.setProtagonist(protagonist)

}