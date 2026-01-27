
import React, { useState, useEffect, useRef } from 'react';
import { Monitor, MonitorOff, Users, Play } from 'lucide-react';

interface LiveSessionProps {
  channel: any;
  currentUser: any;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ channel, currentUser }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [activePresenter, setActivePresenter] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!channel) return;

    const handleSignaling = async (payload: any) => {
      const { type, from, message } = payload;
      if (from === currentUser.id) return;

      if (type === 'broadcast_screen_share_start') {
        setActivePresenter(from);
        // If someone starts sharing, prepare to receive
        setupPeerConnection(false, from);
      } else if (type === 'webrtc_signal') {
        if (!pcRef.current) setupPeerConnection(false, from);
        
        const { sdp, candidate } = message;
        if (sdp) {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
          if (sdp.type === 'offer') {
            const answer = await pcRef.current?.createAnswer();
            await pcRef.current?.setLocalDescription(answer!);
            channel.send({
              type: 'broadcast',
              event: 'webrtc_signal',
              payload: { type: 'webrtc_signal', from: currentUser.id, to: from, message: { sdp: answer } }
            });
          }
        } else if (candidate) {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } else if (type === 'broadcast_screen_share_stop') {
        stopSession();
      }
    };

    channel.on('broadcast', { event: 'webrtc_signal' }, (p: any) => handleSignaling(p.payload));
    channel.on('broadcast', { event: 'broadcast_screen_share_start' }, (p: any) => handleSignaling(p.payload));
    channel.on('broadcast', { event: 'broadcast_screen_share_stop' }, (p: any) => handleSignaling(p.payload));

  }, [channel, currentUser]);

  const setupPeerConnection = (isInitiator: boolean, targetId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc_signal',
          payload: { type: 'webrtc_signal', from: currentUser.id, to: targetId, message: { candidate: event.candidate } }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (isInitiator && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pcRef.current = pc;
    return pc;
  };

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setIsSharing(true);
      setActivePresenter(currentUser.id);

      stream.getVideoTracks()[0].onended = stopSharing;

      channel.send({
        type: 'broadcast',
        event: 'broadcast_screen_share_start',
        payload: { type: 'broadcast_screen_share_start', from: currentUser.id }
      });

      const pc = setupPeerConnection(true, 'everyone');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      channel.send({
        type: 'broadcast',
        event: 'webrtc_signal',
        payload: { type: 'webrtc_signal', from: currentUser.id, to: 'everyone', message: { sdp: offer } }
      });
    } catch (err) {
      console.error("Erro ao compartilhar tela:", err);
    }
  };

  const stopSharing = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setIsSharing(false);
    stopSession();
    channel.send({
      type: 'broadcast',
      event: 'broadcast_screen_share_stop',
      payload: { type: 'broadcast_screen_share_stop', from: currentUser.id }
    });
  };

  const stopSession = () => {
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
    setActivePresenter(null);
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activePresenter ? 'bg-red-500 animate-ping' : 'bg-gray-600'}`} />
          <h4 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Colaboração Live</h4>
        </div>
        {!activePresenter || activePresenter === currentUser.id ? (
          <button 
            onClick={isSharing ? stopSharing : startSharing}
            className={`p-2 rounded-lg transition-all ${isSharing ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'} border`}
          >
            {isSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
          </button>
        ) : (
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[8px] font-bold text-red-500 tracking-widest animate-pulse">
            AO VIVO: {activePresenter.substring(0, 8)}
          </div>
        )}
      </div>

      <div className="aspect-video bg-black/60 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group/video">
        {(remoteStream || (isSharing && localStreamRef.current)) ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.srcObject = remoteStream || localStreamRef.current;
              }
            }}
          />
        ) : (
          <div className="text-center p-6">
            <Users className="mx-auto text-gray-800 mb-2" size={32} />
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest leading-relaxed">
              Inicie uma transmissão para<br/>compartilhar com a equipe
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
