/// <reference path="node_modules/webpack-dev-server/types/lib/Server.d.ts"/>
import type { Configuration } from "webpack";
import './style.scss';

import {Application,Loader} from 'pixi.js';
import * as PIXI from 'pixi.js';
import { setupPixiApplication } from "./src/setup";
import { setupAudioStreaming } from "./src/core/voice-chat";


// Get the div container
const pixiContainer = document.getElementById('main-pixi-container');

if(pixiContainer){
    // Create a new Pixi application
    setupPixiApplication(pixiContainer)
}

setupAudioStreaming()