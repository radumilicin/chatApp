import { useEffect, useRef, useState } from 'react';


export default function useWebSocket (url) {
    const [messages, setMessages] = useState([]); // Store received messages
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);


  useEffect(() => {
    // Initialize WebSocket
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received:', message);
      setMessages((prev) => [...prev, message]);
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
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  };

  return { messages, isConnected, sendMessage };
};