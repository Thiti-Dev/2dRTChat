/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from "webpack";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
gsap.registerPlugin(PixiPlugin);

import './style.scss';
import './background.scss'

// To get rid of the process is not defined, when playing with the data-channel of simple-peer RTC
import process from 'process';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];
// ------------------------------------------------------------------------------------------------

import { createProtagonist, setupPixiApplication } from "./src/setup";
import { setupAudioStreaming } from "./src/core/voice-chat";
import appContext from "./src/states/app-context";
import { socketConnect } from "./src/core/socket";
import { AnimatedSprite, Assets } from "pixi.js";


if (!new class { x:any }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly') // Mobx spec complaint ensuring


// Get the div container
const pixiContainer = document.getElementById('main-pixi-container');

if(pixiContainer){
    (async() => {
        // assets loader
        await Assets.load(["./assets/sheets/c1.json"])
        // -------------

        // Create a new Pixi application
        const {app,worldContainer} = await setupPixiApplication(pixiContainer)
        appContext.setPixiApplication(app, worldContainer)

        let person:string| null = null;
        while(!person){
            person = prompt("Who are you? . . .", "");
        }

        createProtagonist(app,worldContainer) // Create controllable character

        appContext.getProtagonistCharacter().setNameTag(person as string)

        const socket = socketConnect(person)
        appContext.setSocketInstance(socket)

        setupAudioStreaming(socket)
    })()
}