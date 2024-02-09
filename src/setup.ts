import { Application, Texture, TilingSprite } from "pixi.js";
import { Character } from "./classes/character";
import appContext from "./states/app-context";
export async function setupPixiApplication(container: HTMLElement): Promise<Application<HTMLCanvasElement>>{
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
    return app
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

    const protagonist = new Character("Me") // Default placeholder name when isn't finished loading -> Me
    protagonist.registerCustomTicker(app)
    protagonist.spawnToScene(app,70,530)
    protagonist.registerMovementListener()

    appContext.setProtagonist(protagonist)
    
}