import Peer from "simple-peer";
import { Character } from "../classes/character";

type SignalData = Peer.SignalData


type PeerConn = {
    peerID: string;
    peer: Peer.Instance
    IAM?: AdditionalSignalingIAMPayload['callerIAM']
}

type SignalingPayload = {
    id?:string;
    signal: SignalData,
    callerID:string
    userToSignal: string
} & AdditionalSignalingIAMPayload

type AdditionalSignalingIAMPayload = {
    callerIAM: string
}

// Synchronization
type PlayerPositioningUpdatePayload = {
    type: 'pos_update';
    x: number;
    y: number;
    isDormant?: boolean
    id: string;
    directionHeading: 'LEFT' | 'RIGHT'
}

type PlayerData = {
    name: string
    position: {x:number,y:number}
    character: Character
    audioElement?: HTMLAudioElement
}

export {
    PeerConn,
    SignalingPayload,
    SignalData,
    PlayerPositioningUpdatePayload,
    PlayerData
}