import { io } from "socket.io-client";
import Peer from "simple-peer";
import { SignalingPayload, PeerConn,SignalData } from "../shared/types";
import { DEFAULT_VOLUME } from "../shared/constants/config";

let localStream:MediaStream,peerLists:PeerConn[]=[]
const socket = io('http://localhost:3000')
export async function setupAudioStreaming(){
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
                })
                console.log('[audio-server]: Joined user -> ', payload.callerID)
            });

            socket.on("receiving returned signal", (payload:SignalingPayload) => {
                const item = peerLists.find(p => p.peerID === payload.id);
                item?.peer.signal(payload.signal);

                console.log('[audio-server]: Received returned signal -> ', payload)
            });

            socket.on("disconnect notify", (disconnectedSocketID:string) => {
                console.log('[audio-server]: Received disconnection notify from: ', disconnectedSocketID)
                document.getElementById(disconnectedSocketID)?.remove()
                
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
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
    });
    peer.on("signal", signal => {
        socket.emit("sending signal", { userToSignal, callerID, signal })
    })
    appendAudioElement(userToSignal, stream)
    return peer;
}

function addPeer(incomingSignal:SignalData, callerID:string, stream:MediaStream) {
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
    })
    peer.on("signal", signal => {
        socket.emit("returning signal", { signal, callerID })
    })
    peer.signal(incomingSignal);
    appendAudioElement(callerID, stream)
    return peer;
}