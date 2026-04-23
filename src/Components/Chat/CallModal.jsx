import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser }  from '../../redux/slices/authSlice';
import { getSocket }   from '../../services/socketService';
import SimplePeer      from 'simple-peer';

// ── Call states ────────────────────────────────────────────────────────────────
const CALL_STATE = {
  IDLE:      'idle',
  CALLING:   'calling',    // outgoing — waiting for answer
  INCOMING:  'incoming',   // incoming — ringing
  ACTIVE:    'active',     // call connected
  ENDED:     'ended',
};

export default function CallModal({ conversation, targetUserId, targetName, isOnline }) {
  const user   = useSelector(selectUser);
  const socket = getSocket();

  const [callState,  setCallState]  = useState(CALL_STATE.IDLE);
  const [callType,   setCallType]   = useState('video'); // 'video' | 'audio'
  const [isMuted,    setIsMuted]    = useState(false);
  const [isCamOff,   setIsCamOff]   = useState(false);
  const [duration,   setDuration]   = useState(0);
  const [incomingData, setIncomingData] = useState(null); // { from, fromName, callType, signal }

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef        = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);
  const ringtoneRef    = useRef(null);

  // ── Format duration ────────────────────────────────────────────────────────
  function formatDuration(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Start timer ────────────────────────────────────────────────────────────
  function startTimer() {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  }

  // ── Stop timer ─────────────────────────────────────────────────────────────
  function stopTimer() {
    clearInterval(timerRef.current);
    setDuration(0);
  }

  // ── Get user media ─────────────────────────────────────────────────────────
  async function getMedia(type) {
    const constraints = {
      audio: true,
      video: type === 'video' ? { width: 1280, height: 720 } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  }

  // ── Stop all media tracks ──────────────────────────────────────────────────
  function stopMedia() {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }

  // ── Destroy peer ───────────────────────────────────────────────────────────
  function destroyPeer() {
    peerRef.current?.destroy();
    peerRef.current = null;
  }

  // ── Full cleanup ───────────────────────────────────────────────────────────
  function cleanup() {
    stopMedia();
    destroyPeer();
    stopTimer();
    setCallState(CALL_STATE.IDLE);
    setIsMuted(false);
    setIsCamOff(false);
    setIncomingData(null);
  }

  // ── Listen for socket events ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    socket.on('incoming_call', (data) => {
      console.log('📞 Incoming call from:', data.fromName);
      setIncomingData(data);
      setCallType(data.callType);
      setCallState(CALL_STATE.INCOMING);
    });

    // Call accepted — create peer as initiator
    socket.on('call_accepted', async ({ signal }) => {
      console.log('✅ Call accepted');
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    });

    // Call rejected
    socket.on('call_rejected', ({ by }) => {
      console.log('❌ Call rejected by:', by);
      cleanup();
      setCallState(CALL_STATE.ENDED);
      setTimeout(() => setCallState(CALL_STATE.IDLE), 2000);
    });

    // Call ended
    socket.on('call_ended', () => {
      console.log('📵 Call ended by other party');
      cleanup();
    });

    // ICE candidates
    socket.on('ice_candidate', ({ candidate }) => {
      if (peerRef.current && candidate) {
        peerRef.current.signal({ type: 'candidate', candidate });
      }
    });

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('ice_candidate');
    };
  }, [socket]);

  // ── Initiate call ──────────────────────────────────────────────────────────
  async function initiateCall(type) {
    try {
      setCallType(type);
      setCallState(CALL_STATE.CALLING);

      const stream = await getMedia(type);

      const peer = new SimplePeer({
        initiator: true,
        trickle:   false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        socket.emit('call_user', {
          targetUserId: targetUserId,
          callType:     type,
          signal,
          callerName:   user.name,
          callerRole:   user.role,
        });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState(CALL_STATE.ACTIVE);
        startTimer();
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        endCall();
      });

      peer.on('close', () => cleanup());

      peerRef.current = peer;
    } catch (err) {
      console.error('Failed to get media:', err);
      cleanup();
      alert('Could not access camera/microphone. Please check permissions.');
    }
  }

  // ── Accept incoming call ───────────────────────────────────────────────────
  async function acceptCall() {
    try {
      const stream = await getMedia(incomingData.callType);

      const peer = new SimplePeer({
        initiator: false,
        trickle:   false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        socket.emit('call_accepted', {
          targetUserId: incomingData.from,
          signal,
        });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setCallState(CALL_STATE.ACTIVE);
        startTimer();
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        endCall();
      });

      peer.on('close', () => cleanup());

      // Signal the offer from caller
      peer.signal(incomingData.signal);
      peerRef.current = peer;
    } catch (err) {
      console.error('Failed to accept call:', err);
      rejectCall();
    }
  }

  // ── Reject incoming call ───────────────────────────────────────────────────
  function rejectCall() {
    socket.emit('call_rejected', { targetUserId: incomingData?.from });
    cleanup();
  }

  // ── End active call ────────────────────────────────────────────────────────
  function endCall() {
    const targetId = incomingData?.from || targetUserId;
    socket.emit('call_ended', { targetUserId: targetId });
    cleanup();
  }

  // ── Toggle mute ────────────────────────────────────────────────────────────
  function toggleMute() {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setIsMuted(m => !m);
    }
  }

  // ── Toggle camera ──────────────────────────────────────────────────────────
  function toggleCam() {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setIsCamOff(c => !c);
    }
  }

  // ── IDLE state — show call buttons in chat header ──────────────────────────
  if (callState === CALL_STATE.IDLE) {
    return (
      <div className="flex items-center gap-2">
        {/* Audio call */}
        <button
          onClick={() => initiateCall('audio')}
          disabled={!isOnline}
          title={isOnline ? 'Audio call' : `${targetName} is offline`}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-gray-100 hover:bg-teal-100 hover:text-teal-600 text-gray-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>

        {/* Video call */}
        <button
          onClick={() => initiateCall('video')}
          disabled={!isOnline}
          title={isOnline ? 'Video call' : `${targetName} is offline`}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-gray-100 hover:bg-teal-100 hover:text-teal-600 text-gray-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </button>
      </div>
    );
  }

  // ── Full screen call UI ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[2000] bg-gray-900 flex flex-col">

      {/* Remote video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover
          ${callState !== CALL_STATE.ACTIVE ? 'hidden' : ''}`}
      />

      {/* Waiting overlay */}
      {callState !== CALL_STATE.ACTIVE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-teal-600 flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-2xl">
            {(incomingData?.fromName || targetName)?.charAt(0)?.toUpperCase()}
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">
            {incomingData?.fromName || targetName}
          </h2>

          {callState === CALL_STATE.CALLING && (
            <p className="text-gray-400 text-sm animate-pulse">
              Calling... {callType === 'video' ? '📹' : '📞'}
            </p>
          )}

          {callState === CALL_STATE.INCOMING && (
            <p className="text-teal-400 text-sm animate-pulse">
              Incoming {incomingData?.callType === 'video' ? 'video' : 'audio'} call...
            </p>
          )}

          {callState === CALL_STATE.ENDED && (
            <p className="text-red-400 text-sm">Call ended</p>
          )}
        </div>
      )}

      {/* Local video (picture-in-picture) */}
      {callType === 'video' && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`absolute bottom-24 right-4 w-36 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl
            ${isCamOff ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* Audio local ref (hidden) */}
      {callType === 'audio' && (
        <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
      )}

      {/* Duration */}
      {callState === CALL_STATE.ACTIVE && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full">
          {formatDuration(duration)}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">

        {/* Mute */}
        {callState === CALL_STATE.ACTIVE && (
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
              ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>
        )}

        {/* Camera toggle (video calls only) */}
        {callState === CALL_STATE.ACTIVE && callType === 'video' && (
          <button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
              ${isCamOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            {isCamOff ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23"/>
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            )}
          </button>
        )}

        {/* Accept (incoming only) */}
        {callState === CALL_STATE.INCOMING && (
          <button
            onClick={acceptCall}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-xl transition-all animate-bounce"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.95-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
        )}

        {/* End / Reject call */}
        <button
          onClick={callState === CALL_STATE.INCOMING ? rejectCall : endCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 2 2 0 0 1-.45-2.11c.127-.96.361-1.903.7-2.81a2 2 0 0 0-2-1.72H4a2 2 0 0 0-1.95 1.61 19.79 19.79 0 0 0 3.07 8.63A19.5 19.5 0 0 0 10.5 21.5"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>

      </div>

      {/* Call type label */}
      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
        {callType === 'video' ? '📹 Video' : '📞 Audio'}
      </div>

    </div>
  );
}