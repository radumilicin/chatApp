import { useEffect, useRef, useState } from 'react';
import { X3DHClient } from './x3dh-client';
import { ConversationManager } from './ConversationManager';
import { DoubleRatchet } from './DoubleRatchet';

export default function useWebSocket (url, user, contacts, updateContacts, setDecryptedContacts, identityKey, signedPreKey, setMessages, incomingSoundsEnabled, 
                                        outgoingMessagesSoundsEnabled, decryptAllMessages, fetchContacts, loadConversationRatchetStateDB) {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const audioRef = useRef(null);
    const signedPreKeyRef = useRef(signedPreKey);
    const identityKeyRef = useRef(identityKey);
    const contactsRef = useRef(contacts);

    // Keep refs in sync with latest props
    useEffect(() => { signedPreKeyRef.current = signedPreKey; }, [signedPreKey]);
    useEffect(() => { identityKeyRef.current = identityKey; }, [identityKey]);
    useEffect(() => { contactsRef.current = contacts; }, [contacts]);

    useEffect(() => {
        // Don't connect if URL is not set
        if (!url) {
            return;
        }

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
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
            console.error('Raw event.data:', event.data);
            console.error('Type of event.data:', typeof event.data);
            return;
          }

          // ✅ Ignore acknowledgments
          if (message.type === 'ack') {
            console.log('Message acknowledged by server');
            return;
          }

          console.log('Message received:', message);
          console.log('🔴 RAW MESSAGE FROM WEBSOCKET:', message);
          console.log('🔴 Has group_id?', !!message.group_id);
          console.log('🔴 Has ciphertext?', !!message.ciphertext);
          console.log('🔴 Has plaintext message?', !!message.message);
          console.log('Time:', Date.now().toString())

          // Handle group messages (no decryption)
          if (message.hasOwnProperty("group_id")) {
            console.log('🔴 Group message received - no decryption needed');

            const group_message = {
              sender_id: message.sender_id,
              recipient_ids: message.recipient_ids,
              group_id: message.group_id,
              message: message.message,
              timestamp: message.timestamp
            };

            setDecryptedContacts((currArr) => {
              console.log('🔵 PREV state (group):', currArr);

              if (!currArr) return currArr;

              const updated_state = currArr.map((elem) => {
                if (elem.id === message.group_id) {
                  const msgs_group = [...(elem.message || []), group_message];
                  localStorage.setItem(`group_conversation_${user}_${message.group_id}`, JSON.stringify(msgs_group));
                  console.log(`🔵 localStorage group conversation ${message.group_id}:`, msgs_group);

                  return {
                    ...elem,
                    message: msgs_group
                  };
                }
                return elem;
              });

              console.log('🔵 UPDATED state (group):', updated_state);
              return updated_state;
            });

            if (incomingSoundsEnabled) {
              audioRef.current.play().catch(err => {
                console.error("Error playing notification wawaweewa:", err);
              });
            }
            return;
          }

          // Handle individual messages (with decryption)
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

          // ✅ Update decryptedContacts for individual messages
          setDecryptedContacts((currArr) => {
            console.log('🔵 PREV state:', currArr);

            if (!currArr) return currArr;

            const updated_state = currArr.map((elem) => {
              if((elem.contact_id === user && elem.sender_id === contact_id) || (elem.sender_id === user && elem.contact_id === contact_id)){
                const updated_message = [...(elem.message || []), decrypted_message];

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
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, incomingSoundsEnabled]);

    const sendMessage = async (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));

        var contact_id = null
        var msg = null
        if(message.hasOwnProperty("group_id")) {
          msg = {
            "sender_id": message.sender_id,
            "recipient_ids": message.recipient_ids,
            "group_id": message.group_id,
            "message": message.message,
            "timestamp": message.timestamp
          };
        } else {
          contact_id = message.sender_id === user ? message.recipient_id : message.sender_id;
          msg = {
            "sender_id": message.sender_id,
            "recipient_id": message.recipient_id,
            "message": message.message,
            "timestamp": message.timestamp
          };
        }
        // check whether message is intended for group or for user
        setDecryptedContacts((currArr) => {
          console.log('🔵 PREV state:', currArr);
          
          // ✅ Handle empty array - initialize from contacts
          if (!currArr || currArr.length === 0) {
            console.log('🔵 Empty array - initializing from contacts');
            
            var contact = null
            if(message.hasOwnProperty("group_id")){
              contact = contacts.find((elem) => elem.id === message.group_id)
            } else {
              contact = contacts.find((elem) => (elem.sender_id === user && elem.contact_id === contact_id) || 
                                                (elem.sender_id === contact_id && elem.contact_id === user));
            }
            
            if (contact) {
              console.log('🔵 Found contact, creating initial state');
              return [{
                ...contact,
                message: [msg]  // ✅ Initialize message array with first message
              }];
            }
            
            console.log('🔵 Contact not found');
            return currArr;
          }
          
          // ✅ Handle existing array - update or add contact
          var contactExists = null
          if(message.hasOwnProperty("group_id")){
            contactExists = currArr.some((elem) => elem.id === message.group_id);
          } else {
            contactExists = currArr.some((elem) => (elem.sender_id === user && elem.contact_id === contact_id) || 
                                                   (elem.sender_id === contact_id && elem.contact_id === user));
          }
          
          if (!contactExists) {
            var contact_2 = null
            if(message.hasOwnProperty("group_id")){
              contact_2 = contacts.find((elem) => elem.id === message.group_id);
            } else {
              // Contact not in decryptedContacts yet, add it from contacts
              contact_2 = contacts.find((elem) => (elem.sender_id === user && elem.contact_id === contact_id) ||
                                                  (elem.sender_id === contact_id && elem.contact_id === user));
            }

            if (contact_2) {
              console.log('🔵 Adding new contact to decryptedContacts');
              return [...currArr, {
                ...contact_2,
                message: [msg]
              }];
            }
          }
          
          // Contact exists, update it
          const updated_state = currArr.map((elem) => {
            // Handle group messages
            if (message.hasOwnProperty("group_id")) {
              if (elem.id === message.group_id) {
                let msgs_group = [...(elem.message || []), msg];
                localStorage.setItem(`group_conversation_${user}_${message.group_id}`, JSON.stringify(msgs_group));
                console.log(`🔵 localStorage group conversation ${message.group_id}:`, msgs_group);

                return {
                  ...elem,
                  message: msgs_group
                };
              }
              return elem;
            }

            // Handle individual messages
            if ((elem.sender_id === user && elem.contact_id === contact_id) ||
                (elem.sender_id === contact_id && elem.contact_id === user)) {

                let msgs_contact = [...(elem.message || []), msg];
                localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(msgs_contact));
                console.log(`🔵 localStorage conversation with user ${user}:`, msgs_contact);

                return {
                  ...elem,
                  message: msgs_contact
                };
            }
            return elem;
          });
          
          console.log('🔵 UPDATED state:', updated_state);

          return updated_state;
        });

        // Only load ratchet state for individual (encrypted) messages, not group messages
        if (!message.hasOwnProperty("group_id")) {
          const found_contact = contacts.find((elem) => (user === elem.sender_id && contact_id === elem.contact_id) || (contact_id === elem.sender_id && user === elem.contact_id))
          if(found_contact) {
            const ratchetState = await loadConversationRatchetStateDB(user, found_contact)
            if(ratchetState) {
              console.log("Ratchet state after sending message (webSocket): ", ratchetState);
            }
          }
        }   
      
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

    const currentSignedPreKey = signedPreKeyRef.current;
    const currentIdentityKey = identityKeyRef.current;
    const currentContacts = contactsRef.current;

    if (!currentIdentityKey || !currentSignedPreKey) {
      console.error('Keys not loaded yet (signedPreKey or identityKey is null). Skipping decryption.');
      return null;
    }

    const decryption_key = X3DHClient.getOrCreateLocalKey();

    // ✅ Load ratchet from DB
    const contact = currentContacts.find((elem) =>
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
        console.log('- My signedPreKey:', currentSignedPreKey);
        console.log('- My identityKey:', currentIdentityKey);

        const sharedSecret = await X3DHClient.performX3DHAsReceiver(
          currentIdentityKey,
          currentSignedPreKey,
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
          currentSignedPreKey
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
          console.log("IN WEB SOCKET WE GOT THE PLAINTEXT")
          // ✅ ratchet.decrypt() automatically saves updated state to DB
        }
      
        console.log(`After decryption with plaintext = ${plaintext}`);

        if(plaintext) {
          let message_details = {
              "sender_id": message.sender_id,
              "recipient_id": message.recipient_id,
              "message": plaintext,
              "timestamp": message.timestamp
            };
            
            let existing_messages = JSON.parse(localStorage.getItem(`conversation_${user}_${contact_id}`) || '[]');
            let convo_after_dec = [...existing_messages, message_details];
            localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(convo_after_dec));
            
            console.log("conversation in webSockets after decryption: " + localStorage.getItem(`conversation_${user}_${contact_id}`));
          
          return message_details;
        } else return {
          "sender_id": message.sender_id,
          "recipient_id": message.recipient_id,
          "message": "",
          "timestamp": message.timestamp
        };
        
        // ❌ REMOVED all ConversationManager calls - DB handles it now
        
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        return null;
      }
    }

    await ratchet.updateRatchetState();

    console.log("conversation in webSockets after decryption: " + localStorage.getItem(`conversation_${user}_${contact_id}`));

    return null;
  }

  return { isConnected, sendMessage };
};