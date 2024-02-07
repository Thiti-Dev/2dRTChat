import { Application, Assets, Sprite, Texture, TilingSprite } from "pixi.js";
import { Character } from "./classes/character";
export async function setupPixiApplication(container: HTMLElement){
    const app = new Application<HTMLCanvasElement>({
        width: container.clientWidth, // Match the width of your div
        height: container.clientHeight, // Match the height of your div
        backgroundColor:  0x1099bb, // Set the background color
    });

    window.addEventListener('resize', () => {
        app.renderer.resize(container.clientWidth, container.clientHeight);
    });

    container.appendChild(app.view);

    addTilingBackgroundImage(app)
    
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

    const character = new Character("Thiti-Dev")
    character.registerCustomTicker(app)
    character.spawnToScene(app,70,530)
    character.registerMovementListener()
    
}