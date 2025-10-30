import { useEffect, useRef, useState } from 'react';


export default function useWebSocket (url, setMessages, incomingSoundsEnabled, outgoingMessagesSoundsEnabled) {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Initialize WebSocket
        ws.current = new WebSocket(url);
        
        // Create audio element for notification sound
        audioRef.current = new Audio('/borat-wawaweewa.mp3');

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message received:', message);
            setMessages((prev) => [...prev, message]);
            if(incomingSoundsEnabled) {
              audioRef.current.play().catch(err => {
                console.error("Error playing notification wawaweewa:", err)
              }); 
            }
        };


        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
           console.error('WebSocket error:', error);
        };

        // Cleanup on unmount
        return () => {
            ws.current.close();
        };
    }, [url, incomingSoundsEnabled]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
        
      if(audioRef.current !== null && outgoingMessagesSoundsEnabled) {
        audioRef.current.play().catch(err => {
          console.error("Error playing notification wawaweewa:", err)
        }); 
      }
    } else {
      console.error('WebSocket is not open');
    }
  };

  return { isConnected, sendMessage };
};