import type { Socket } from "socket.io-client";
import Peer from "simple-peer";
import type { SignalingPayload, PeerConn,SignalData } from "../shared/types";
import { DEFAULT_VOLUME } from "../shared/constants/config";
import { removePlayer, positioningEventHandler, spawnSyncedPlayer } from "./player-synchronization";
import appContext from "../states/app-context";

let localStream:MediaStream,peerLists:PeerConn[]=[] // already considered isolates into mobx state

export async function setupAudioStreaming(socket: Socket){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
                 spawnSyncedPlayer(payload.callerID,payload.callerIAM)
            });

            socket.on("receiving returned signal", (payload:SignalingPayload) => {
                const item = peerLists.find(p => p.peerID === payload.id);
                item?.peer.signal(payload.signal);

                console.log(`[audio-server]: Received returned signal from socket_id:${payload.id} IAM: ${payload.callerIAM}`) // rename later, this shouldn't be named callerIAM
            
                // Spawn to world
                spawnSyncedPlayer(payload.id!,payload.callerIAM)
            });

            socket.on("disconnect notify", (disconnectedSocketID:string) => {
                console.log('[audio-server]: Received disconnection notify from: ', disconnectedSocketID)
                document.getElementById(disconnectedSocketID)?.remove()
                removePlayer(disconnectedSocketID) // remove disconnected player from the world
                
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
    const userAudio: any = document.getElementById(`${socketID}-audio`)!;
    userAudio.srcObject = stream;
    userAudio.volume = DEFAULT_VOLUME
    userAudio.play();
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

    appendAudioElement(userToSignal, stream)

    peer.on('data', positioningEventHandler);

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
    appendAudioElement(callerID, stream)

    peer.on('data', positioningEventHandler);

    return peer;
}

// Isolate into mobx action later . . .
export function broadCastDataToPeers(payload:any){
    const stringifiedPayload= JSON.stringify(payload)
    for(const {peer} of peerLists){
        peer.send(stringifiedPayload)
    }
}