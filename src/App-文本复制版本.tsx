import { PureComponent, useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection>()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const localStreamRef = useRef<MediaStream>()

  useEffect(()=>{
    getMediaDevices().then(()=>{
      createRtcConnnection()
      addLocalStreamToRtcConnection()
    })
  },[ ])
  
  const getMediaDevices = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    console.log('stream',stream)
    if(localVideoRef.current){
        localVideoRef.current.srcObject = stream
        localStreamRef.current = stream
      }
  }

  const createRtcConnnection = ()=>{
    const _pc = new RTCPeerConnection({
      iceServers:[
        {
          urls: ['stun:stun.stunprotocol.org:3478']
        }
      ]
    })
    _pc.onicecandidate = e=>{
      if(e.candidate){
        console.log('candidate',JSON.stringify(e.candidate))
      }
    }
    _pc.ontrack=e=>{
      console.log(e)
      if(remoteVideoRef.current){
        remoteVideoRef.current.srcObject=e.streams[0]
      }
    }
    pc.current = _pc
    
    console.log('创建成功',_pc)
  }

  const createOffer=()=>{
    pc.current?.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }).then(sdp =>{
      console.log('offer',JSON.stringify(sdp))
      pc.current?.setLocalDescription(sdp)
    })
  }

  const createAnswer=()=>{
    pc.current?.createAnswer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    }).then(sdp =>{
      console.log('answer',JSON.stringify(sdp))
      pc.current?.setLocalDescription(sdp)
    })
  }

  const setRemoteDescription=()=>{
    if(textRef.current){
      const remoteSdp = JSON.parse(textRef.current.value)
      pc.current?.setRemoteDescription(new RTCSessionDescription(remoteSdp))
      console.log('设置远程描述成功',remoteSdp)
    }
  }

  const addCandidate=()=>{
    if(textRef.current){
      const candidate = JSON.parse(textRef.current.value)
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('添加候选成功',candidate)
    }

  }

  const addLocalStreamToRtcConnection=()=>{
    const localStream = localStreamRef.current
    localStream?.getTracks().forEach(track =>{
      pc.current?.addTrack(track, localStream)
    })
    console.log('将本地视频流添加到 RTC 连接中成功')
  }

  return (
    <div>
        <video ref={localVideoRef} autoPlay controls></video>
        <video ref={remoteVideoRef} autoPlay controls></video>
      <br />
      <button onClick={createOffer}>创建Offer</button>
      <br />
      <textarea ref={textRef}></textarea>
      <br />
      <button onClick={setRemoteDescription}>设置远程描述</button>
      <br />
      <button onClick={createAnswer}>创建Answer</button>
      <br />
      <button onClick={addCandidate}>添加候选</button>
    </div>
  )
}

export default App 
