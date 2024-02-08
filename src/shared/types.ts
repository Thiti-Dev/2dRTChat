import Peer from "simple-peer";

type SignalData = Peer.SignalData


type PeerConn = {
    peerID: string;
    peer: Peer.Instance
}

type SignalingPayload = {
    id?:string;
    signal: SignalData,
    callerID:string
    userToSignal: string
}
export {
    PeerConn,
    SignalingPayload,
    SignalData
}