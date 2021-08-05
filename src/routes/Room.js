import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { useParams } from "react-router";
import { 
  setVideoTrackID, 
  setAudioTrackID,
  toggleVideoTrackEnabled,
  toggleAudioTrackEnabled
} from "../features/localStream/localStreamSlice";
import { useDispatch, useSelector } from "react-redux";
const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 80vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, [props.preer]);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const iceServers = {
  iceServers: [
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    },
    {
      "urls": [
      "turn:13.250.13.83:3478?transport=udp"
      ],
      "username": "YzYNCouZM1mhqhmseWk6",
      "credential": "YzYNCouZM1mhqhmseWk6"
      }
  ],
}

const Room = (props) => {
    const params = useParams()
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const {roomID} = params

    const [localStream, setLocalStream] = useState()
    const {
      videoTrackID,
      videoTrackEnabled,
      audioTrackID,
      audioTrackEnabled,
    } = useSelector(store => store.localStream.value)
    const dispatch = useDispatch()
    


    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_SOCKET_IO);
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true })
            .then(currentStream => {
                if (!currentStream) {
                    // console.error("you must allow app access your camera and micro to meeting.")    
                    return;
                } 
                setLocalStream(currentStream)
                // set default track
                dispatch(setAudioTrackID(currentStream.getAudioTracks()[0].id))
                dispatch(setVideoTrackID(currentStream.getVideoTracks()[0].id))
                userVideo.current.srcObject = currentStream;
                socketRef.current.emit("x_join_room", roomID);
                socketRef.current.on("all_users", users => {
                    // console.debug(`get remote user info:  ${users}`)
                    const remotePeers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, currentStream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        remotePeers.push(peer);
                    })
                    setPeers(remotePeers);
                })
                
                socketRef.current.on("user_joined", payload => {
                    // console.debug(`get info new user joined room:  ${payload}`)
                    const peer = addPeer(payload.signal, payload.callerID, currentStream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })
        
                    setPeers(users => [...users, peer]);
                });
        
                socketRef.current.on("receiving_returned_singal", payload => {
                    // console.debug(`get receiving_returned_singal: ${payload}`)
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });
                socketRef.current.on("room_full", () => {
                    alert("room full")
                })
            })


    }, []);
    
    useEffect(()=> {
      if (localStream) {
        console.debug(localStream.getTrackById(audioTrackID).label)
        localStream.getTrackById(audioTrackID).enabled = audioTrackEnabled
      }
    }, [audioTrackEnabled])
    
    useEffect(()=> {
      if (localStream) {
        console.debug(localStream.getTrackById(videoTrackID).label)
        localStream.getTrackById(videoTrackID).enabled = videoTrackEnabled
      }
    }, [videoTrackEnabled])

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
            config: iceServers
        });

        peer.on("signal", signal => {
            // console.debug(`creatPeer handle signal:${signal}`)
            socketRef.current.emit("sending_signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
            config: iceServers
        })

        peer.on("signal", signal => {
          // console.debug(`addPeer handle signal: ${signal}`)
            socketRef.current.emit("returning_signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
      <div>
        <Container>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
        <div>
          <button onClick={() => dispatch(toggleVideoTrackEnabled())}>{videoTrackEnabled===true ? "Disable ": "Enable "} Video</button>
          <button onClick={() => dispatch(toggleAudioTrackEnabled())}>{audioTrackEnabled===true ? "Disable ": "Enable "} Audio</button>
        </div>
      </div>
    );
};

export default Room;

