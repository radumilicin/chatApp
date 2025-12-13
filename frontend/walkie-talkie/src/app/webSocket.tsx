import { useEffect, useRef, useState } from 'react';
import { X3DHClient } from './x3dh-client';
import { ConversationManager } from './ConversationManager';
import { DoubleRatchet } from './DoubleRatchet';

// user !== "" && user !== null ? `ws://localhost:8080?userId=${user}` : null, 
//     user,
//     contacts,
//     updateContacts, 
//     setDecryptedContacts,
//     identityKey,
//     signedPreKey,
//     setMessages,
//     incomingSoundsEnabled,
//     outgoingMessagesSoundsEnabled,
//     decryptAllMessages,
//     fetchData2,
//     loadConversationRatchetStateDB
export default function useWebSocket (url, user, contacts, updateContacts, setDecryptedContacts, identityKey, signedPreKey, setMessages, incomingSoundsEnabled, 
                                        outgoingMessagesSoundsEnabled, decryptAllMessages, fetchContacts, loadConversationRatchetStateDB) {
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

        // ✅ 2. Fix WebSocket to update state properly
        // this gets triggered both when WE send message and when they send 
        ws.current.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          
          // ✅ Ignore acknowledgments
          if (message.type === 'ack') {
            console.log('Message acknowledged by server');
            return;
          }

          console.log('Message received:', message);
          console.log('🔴 RAW MESSAGE FROM WEBSOCKET:', message);
          console.log('🔴 Has ciphertext?', !!message.ciphertext);
          console.log('🔴 Has plaintext message?', !!message.message);
          
          const contact_id = message.sender_id === user ? message.recipient_id : message.sender_id;
          const decrypted_message = await decryptMessage(message, false, contact_id);

          console.log(`Message received & decrypted is:`, decrypted_message);
          
  

          // ✅ Check if decryption succeeded
          if (!decrypted_message || !decrypted_message.hasOwnProperty("sender_id")) {
            console.error('Failed to decrypt message, not updating state');
            return;
          }
        
          if(decrypted_message.sender_id !== contact_id && decrypted_message.recipient_id !== user) {
            console.error("Malformed decrypted message: sender does not match current id?");
            return;
          }
          
          // ✅ Update decryptedContacts, not contacts
          setDecryptedContacts((currArr) => {
            console.log('🔵 PREV state:', currArr);
            
            if (!currArr) return currArr;

            var updated_state = null
            var updated_message = null



            updated_state = currArr.map((elem) => {
              if((elem.contact_id === user && elem.sender_id === contact_id) || (elem.sender_id === user && elem.sender_id === contact_id)){
                updated_message = [...elem.message, decrypted_message];

                return {
                  ...elem,
                  message: updated_message
                }
              }

              return elem;
            })
            
            console.log('🔵 UPDATED state:', updated_state);
            return updated_state;
          });
          
          if (incomingSoundsEnabled) {
            audioRef.current.play().catch(err => {
              console.error("Error playing notification wawaweewa:", err);
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

    const sendMessage = async (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));

        const contact_id = message.sender_id === user ? message.recipient_id : message.sender_id;
        const decrypted_message = await decryptMessage(message, false, contact_id);
        
        console.log(`Message received & decrypted is:`, decrypted_message);
        
        // ✅ Check if decryption succeeded
        if (!decrypted_message || !decrypted_message.hasOwnProperty("sender_id")) {
          console.error('Failed to decrypt message, not updating state');
          return;
        }

        if(decrypted_message.sender_id !== user || decrypted_message.recipient_id !== contact_id) {
          console.error("Malformed decrypted message: sender does not match current id?");
          return;
        }
        
        // ✅ Update decryptedContacts, not contacts
        // currArr is an array of decryptedContacts.
        // So contacts, but with the added "message" attribute (if it doesn't exist)
        // if it does exist, then just append to the already existing array
        setDecryptedContacts((currArr) => {
          console.log('🔵 PREV state:', currArr);
          
          if (!currArr) return currArr;

          var updated_state = null
          var updated_message = null

          updated_state = currArr.map((elem) => {
            if((elem.sender_id === user && elem.contact_id === contact_id) || (elem.sender_id === contact_id && elem.contact_id === user)){
              updated_message = [...elem.message, decrypted_message];

              return {
                ...elem,
                message: updated_message
              }
            }

            return elem;
          })
          
          console.log('🔵 UPDATED state:', updated_state);
          return updated_state;
        });
        
        if (audioRef.current !== null && outgoingMessagesSoundsEnabled) {
          audioRef.current.play().catch(err => {
            console.error("Error playing notification wawaweewa:", err);
          }); 
        }
      } else {
        console.error('WebSocket is not open');
      }
    };

  async function decryptMessage(message: any, is_group: boolean, contact_id: string) {
    console.log("In decryptMessage (WebSocket)")
    
    const decryption_key = X3DHClient.getOrCreateLocalKey();
    
    // ✅ Load ratchet from DB
    const contact = contacts.find((elem) => 
      (elem.sender_id === user && elem.contact_id === contact_id) || 
      (elem.contact_id === user && elem.sender_id === contact_id)
    );
    
    if (!contact) {
      console.error('Contact not found');
      return null;
    }

    let ratchet = await loadConversationRatchetStateDB(user, contact);
    
    // Handle first message
    if (message?.is_first_message) {
      console.log("First message detected");

      if (message?.sender_id === user) {
        console.log("We are the sender (Alice) - ratchet already loaded from DB");
        // Ratchet should already be loaded, if not something went wrong
        if (!ratchet) {
          console.error('No ratchet state found for sent message');
          return null;
        }
      } else {
        console.log("We are the receiver (Bob) - initializing ratchet");
        
        console.log('About to perform X3DH as receiver with:');
        console.log('- ephemeralPublicKey:', message.ephemeralPublicKey);
        console.log('- identityKey:', message.identityKey);
        console.log('- My signedPreKey:', signedPreKey);
        console.log('- My identityKey:', identityKey);
        
        const sharedSecret = await X3DHClient.performX3DHAsReceiver(
          identityKey,
          signedPreKey,
          message.ephemeralPublicKey,
          message.identityKey,
          message.oneTimePreKeyId
        );
        
        console.log("=== BOB AFTER X3DH ===");
        console.log("X3DH shared secret:", sharedSecret.substring(0, 30) + "...");
        
        ratchet = DoubleRatchet.initializeAsReceiver(
          user, 
          contact.id,
          sharedSecret,
          signedPreKey
        );
        
        const initialState = ratchet.getState();
        console.log('Bob - Initial ratchet state:', JSON.stringify(initialState, null, 2));
        
        // ✅ Ratchet will auto-save to DB on first decrypt
      }
    }
    
    // Load ratchet from DB if not already loaded
    if (!ratchet) {
      console.log("No ratchet, loading from DB");
      ratchet = await loadConversationRatchetStateDB(user, contact);
      
      if (!ratchet) {
        console.error('Failed to load ratchet state');
        return null;
      }
    }
    
    // Decrypt message
    if (ratchet) {
      try {
        console.log("Before decryption");
        let plaintext = "";
        
        if (user === message.sender_id) {
          console.log("We're decrypting as Alice (our own sent message)");
          plaintext = X3DHClient.decryptForSelf(message.ciphertext_sender, decryption_key);
        } else {
          console.log("We're decrypting as Bob (received message)");
          plaintext = await ratchet.decrypt(message.ciphertext, message.header);
          // ✅ ratchet.decrypt() automatically saves updated state to DB
        }
      
        console.log(`After decryption with plaintext = ${plaintext}`);
        
        return {
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          message: plaintext,
          timestamp: message.timestamp
        };
        
        // ❌ REMOVED all ConversationManager calls - DB handles it now
        
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        return null;
      }
    }

    return null;
  }

  return { isConnected, sendMessage };
};