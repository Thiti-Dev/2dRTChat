import Peer from "simple-peer";

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
    id: string;
}

export {
    PeerConn,
    SignalingPayload,
    SignalData,
    PlayerPositioningUpdatePayload
}