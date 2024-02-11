import type { Socket } from "socket.io-client";
import Peer from "simple-peer";
import type { SignalingPayload, PeerConn,SignalData } from "../shared/types";
import { DEFAULT_VOLUME } from "../shared/constants/config";
import appContext from "../states/app-context";
import Players from "../states/players";
import { sleep } from "../utils/common";
import players from "../states/players";

let localStream:MediaStream,peerLists:PeerConn[]=[] // already considered isolates into mobx state

export async function setupAudioStreaming(socket: Socket){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 2,
            autoGainControl: true,
        } });

        initializeLocalStremDefault() // mute mic , . . . etc

        socket.emit("join room", "1234");
            socket.on("all users", (users) => {
                console.log('[audio-server]: all user has fetched')
                document.getElementById("my-id")!.innerText = socket.id!
                users.forEach((userID:string) => {
                    const peer = createPeer(userID, socket.id!, localStream);
                    peerLists.push({
                        peerID: userID,
                        peer,
                    })
                })
            })

            socket.on("user joined", (payload:SignalingPayload) => {
                const peer = addPeer(payload.signal, payload.callerID, localStream);
                peerLists.push({
                    peerID: payload.callerID,
                    peer,
                    IAM: payload.callerIAM
                })
                console.log(`[audio-server]: Joined user -> socker_id:${payload.callerID} , IAM:${payload.callerIAM}`)
            
                 // Spawn to world
                Players.spawnSyncedPlayer(payload.callerID,payload.callerIAM)
            });

            socket.on("receiving returned signal", (payload:SignalingPayload) => {
                const item = peerLists.find(p => p.peerID === payload.id);
                item?.peer.signal(payload.signal);

                console.log(`[audio-server]: Received returned signal from socket_id:${payload.id} IAM: ${payload.callerIAM}`) // rename later, this shouldn't be named callerIAM
            
                // Spawn to world
                Players.spawnSyncedPlayer(payload.id!,payload.callerIAM)
            });

            socket.on("disconnect notify", (disconnectedSocketID:string) => {
                console.log('[audio-server]: Received disconnection notify from: ', disconnectedSocketID)
                peerLists = peerLists.filter(p => p.peerID !== disconnectedSocketID); // removing out from existing peer lists
                document.getElementById(disconnectedSocketID)?.remove()
                Players.removePlayer(disconnectedSocketID) // remove disconnected player from the world
                
            });
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

function appendAudioElement(socketID:string,stream:MediaStream){
    const userDiv = document.createElement('div');
    userDiv.id = socketID;
    userDiv.innerHTML = `
        <div id="${socketID}">
            <p>User ${socketID}</p>
            <audio id="${socketID}-audio" controls></audio>
        </div>
    `;
    document.getElementById('users')!.appendChild(userDiv);
    const userAudio = document.getElementById(`${socketID}-audio`)! as HTMLAudioElement;
    userAudio.srcObject = stream;
    userAudio.volume = DEFAULT_VOLUME
    userAudio.play();

    Players.registerAudioElementForPlayer(socketID, userAudio)

    /* ----------------------------- Audio Analyzer ----------------------------- */
    const audioContext = new AudioContext();

    // Create a MediaStreamAudioSourceNode to connect to the incoming audio stream
    const audioSourceNode = audioContext.createMediaStreamSource(stream);

    // Create an AnalyserNode to analyze the audio data
    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 32; // Adjust the FFT size based on your requirements

    // Connect the audio source to the analyser
    audioSourceNode.connect(analyserNode);
    // Define a function to analyze the audio data periodically

    // enclosed
    const playerCharacter = players.getPlayerFromSocketID(socketID)
    //
    async function processTalkingIndicatorForPeersCharacter() {
        // Create a buffer to store frequency data
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Get frequency data from the analyser
        analyserNode.getByteFrequencyData(dataArray);

        // Calculate the average volume level
        let totalVolume = 0;
        for (let i = 0; i < bufferLength; i++) {
            totalVolume += dataArray[i];
        }
        const averageVolume = totalVolume / bufferLength;


        if(averageVolume === 0){

            // Check if the player still exists otherwise we return and end the paradox
            if(!players.isPlayerExist(socketID)) return // ends the cycle

            // if mute detected
            // set setTalkingState of this Character instance 
            playerCharacter.character.setTalkingState(false)
            setTimeout(processTalkingIndicatorForPeersCharacter, 500);
        }else{
            // when buffers still has bitsound going on nake it frequent
            playerCharacter.character.setTalkingState(true)
            setTimeout(processTalkingIndicatorForPeersCharacter, 15);
        }
        

        // Determine if the audio is effectively muted [This method to slow to react on the bit receive]
        /*
            onst thresholdPercentage = 20; // 20% lower than the observed average volume level
            const threshold = 20 * (thresholdPercentage / 100);
            const isMuted = averageVolume < threshold; // Adjust threshold as needed
            //Do something based on the mute status
            if (isMuted) {
                console.log(`[${socketID}]: Audio muted`);
            } else {
                console.log(`[${socketID}]: Audio not muted`);
            }
        */
        /* -------------------------------------------------------------------------- */
    }

    // Periodically check the audio data for mute status
    setTimeout(processTalkingIndicatorForPeersCharacter, 15); // Adjust interval as needed
    /* -------------------------------------------------------------------------- */
}


function createPeer(userToSignal:string, callerID:string, stream:MediaStream) {
    const socket = appContext.getSocketInstance()

    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        channelName: 'ConfinedVirtualSpace'
    });
    peer.on("signal", signal => {
        socket.emit("sending signal", { userToSignal, callerID, signal })
    })

    peer.on("stream", (receivedStream) => {
        appendAudioElement(userToSignal, receivedStream)
    })

    peer.on('data', Players.positioningEventHandler.bind(Players));
    setupPeerEvents(peer)

    return peer;
}

function addPeer(incomingSignal:SignalData, callerID:string, stream:MediaStream) {
    const socket = appContext.getSocketInstance()

    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        channelName: 'ConfinedVirtualSpace'
    })
    peer.on("signal", signal => {
        socket.emit("returning signal", { signal, callerID })
    })
    peer.signal(incomingSignal);

    peer.on("stream", (receivedStream) => {
        appendAudioElement(callerID, receivedStream)
    })

    peer.on('data', Players.positioningEventHandler.bind(Players));
    setupPeerEvents(peer)

    return peer;
}

function setupPeerEvents(peer: Peer.Instance){
    peer.on('error', (err) => {
        console.log('Connection error:', err);
    });
    
    // Listen for the 'close' event
    peer.on('close', () => {
        console.log('Connection closed');
    });
    
    // Listen for the 'disconnect' event (this event is specific to the signaling server)
    peer.on('disconnect', () => {
        console.log('Disconnected from signaling server');
    });
}

// Isolate into mobx action later . . .
export function broadCastDataToPeers(payload:any){
    const stringifiedPayload= JSON.stringify(payload)
    for(const {peer} of peerLists){
        if(!peer.connected) continue
        peer.send(stringifiedPayload)
    }
}

export async function pushToTalk(inAction: boolean){
    const localAudioTrack = localStream.getAudioTracks()[0]
    if(localAudioTrack.enabled && inAction) return // already enable

    appContext.getProtagonistCharacter().setTalkingState(inAction)
    localAudioTrack.enabled = inAction
}

function initializeLocalStremDefault(){
    /* ------------------------------- MIC MUTING ------------------------------- */
    localStream.getTracks().forEach(track => {
        track.enabled = false;
    });
    /* -------------------------------------------------------------------------- */

    /* ---------------------------- Proxy setting up ---------------------------- */
    // const proxy = new Proxy(localStream.getAudioTracks()[0], {
    //     set(target, property, value) {
    //         if(property !== 'enabled') return false
    //         type TProxiableMediaStream = Pick<MediaStreamTrack, 'enabled'>
    //         target.enabled = value;
    //         return true; // Indicates success
    //       }
    // })
    /* -------------------------------------------------------------------------- */
}