import type { Socket } from "socket.io-client";
import Peer from "simple-peer";
import type { SignalingPayload, PeerConn,SignalData } from "../shared/types";
import { DEFAULT_VOLUME } from "../shared/constants/config";
import appContext from "../states/app-context";
import Players from "../states/players";

let localStream:MediaStream,peerLists:PeerConn[]=[] // already considered isolates into mobx state

export async function setupAudioStreaming(socket: Socket){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 2,
            autoGainControl: true
        } });

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
    appendAudioElement(callerID, stream)

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
        peer.send(stringifiedPayload)
    }
}