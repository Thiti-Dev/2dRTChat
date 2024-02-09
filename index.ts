/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from "webpack";
import './style.scss';

// To get rid of the process is not defined, when playing with the data-channel of simple-peer RTC
import process from 'process';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];
// ------------------------------------------------------------------------------------------------

import { setupPixiApplication } from "./src/setup";
import { setupAudioStreaming } from "./src/core/voice-chat";
import appContext from "./src/states/app-context";
import { socketConnect } from "./src/core/socket";


if (!new class { x:any }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly') // Mobx spec complaint ensuring


// Get the div container
const pixiContainer = document.getElementById('main-pixi-container');

if(pixiContainer){
    (async() => {
        // Create a new Pixi application
        const app = await setupPixiApplication(pixiContainer)
        appContext.setPixiApplication(app)

        let person:string| null = null;
        while(!person){
            person = prompt("Who are you? . . .", "");
        }
        appContext.getProtagonistCharacter().setNameTag(person as string)

        const socket = socketConnect(person)
        appContext.setSocketInstance(socket)

        setupAudioStreaming(socket)
    })()
}