import { useEffect, useRef, useState } from 'react';
import { X3DHClient } from './x3dh-client';
import { ConversationManager } from './ConversationManager';
import { DoubleRatchet } from './DoubleRatchet';

export default function useWebSocket (url, user, contacts, setDecryptedContacts, updateContacts, identityKey, signedPreKey, setMessages, incomingSoundsEnabled, 
                                        outgoingMessagesSoundsEnabled, decryptAllMessages, fetchContacts) {
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

        ws.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log('Message received:', message);
            setMessages((prev) => [...prev, message]);

            const contact_id = message.sender_id === user ? message.recipient_id : message.sender_id
            const decrypted_message = await decryptMessage(message, false, contact_id)
            const new_contacts = contacts.map((elem) => {
                                                          if(elem.id === message.contact_id){
                                                              return {
                                                                ...elem,
                                                                message: decrypted_message
                                                              }
                                                          }
                                                          return elem
                                                        })
            
            setDecryptedContacts(new_contacts)
            // fetchContacts()
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

  const sendMessage = async (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
        
      const contact_id = message.sender_id === user ? message.recipient_id : message.sender_id
      const decrypted_message = await decryptMessage(message, false, contact_id)
      const new_contacts = contacts.map((elem) => {
                                                    if(elem.id === message.contact_id){
                                                        return {
                                                          ...elem,
                                                          message: decrypted_message
                                                        }
                                                    }
                                                    return elem
                                                  })
      
      setDecryptedContacts(new_contacts)

      if(audioRef.current !== null && outgoingMessagesSoundsEnabled) {
        audioRef.current.play().catch(err => {
          console.error("Error playing notification wawaweewa:", err)
        }); 
      }
    } else {
      console.error('WebSocket is not open');
    }
  };

  async function decryptMessage(message: any, is_group: boolean, contact_id: string) {
    // Fetch encrypted messages from DB
    console.log("In load conversation messages")
     
    let ratchet = null;
    const decryptedMessages = [];
    const decryption_key = X3DHClient.getOrCreateLocalKey();
    
    console.log("Before for loop")
    var decryptedMessage = null
      
    if (message?.is_first_message) {

      // console.log(`message #${i}: ` + JSON.stringify(message))
      // First message - initialize ratchet
      

      if (message?.sender_id === user) {
        console.log("We are the sender")

        // I sent this first message - load saved ratchet state
        var conversation = ConversationManager.loadConversation(contact_id);

        if (!conversation) {
          console.error('No ratchet state found for sent message');
          // continue;
        }
        ratchet = new DoubleRatchet(conversation.ratchetState);
      } else {
        console.log("We are NOT the sender (Bob)");
        
        // Check what we're passing in
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
        console.log("My signed prekey:", signedPreKey.publicKey.substring(0, 30) + "...");
        console.log("Alice's ephemeral key:", message.ephemeralPublicKey.substring(0, 30) + "...");
        console.log("Alice's identity key:", message.identityKey.substring(0, 30) + "...");
        
        ratchet = DoubleRatchet.initializeAsReceiver(
          sharedSecret,
          signedPreKey
        );
        
        const initialState = ratchet.getState();
        console.log('Bob - Initial ratchet state RIGHT AFTER CREATION:');
        console.log('- dhReceivingKey (should be null):', initialState.dhReceivingKey);
        console.log('- dhReceivingKey type:', typeof initialState.dhReceivingKey);
        console.log('- dhSendingKey.publicKey:', initialState.dhSendingKey.publicKey);
        console.log('- Full state:', JSON.stringify(initialState, null, 2));
        
        // Save for future use
        ConversationManager.saveConversation(contact_id, {
          ratchetState: initialState,
          theirIdentityKey: message.identityKey,
        });
        
        // Immediately load back to check if it's saved correctly
        const reloaded = ConversationManager.loadConversation(contact_id);
        console.log('RELOADED state from storage:');
        console.log('- dhReceivingKey after reload:', reloaded.ratchetState.dhReceivingKey);
        console.log('- dhReceivingKey type after reload:', typeof reloaded.ratchetState.dhReceivingKey);
      }
    }
    
    if (!ratchet) {
      console.log("No ratchet, initialising one")
      // Load existing ratchet if not already loaded
      const conversation = ConversationManager.loadConversation(contact_id);
      if (conversation) {
        ratchet = new DoubleRatchet(conversation.ratchetState);
      }
    }
    
    // Decrypt message
    if (ratchet) {
      try {
        console.log("Before decryption")
        var plaintext = ""
        if(user === message.sender_id) {
          console.log("We're decrypting as Alice")
          plaintext = X3DHClient.decryptForSelf(message.ciphertext_sender, decryption_key);
        } else {
          console.log("We're decrypting as Bob")
          plaintext = ratchet.decrypt(message.ciphertext, message.header);
        }
      
        console.log(`After decryption with plaintext = ${plaintext}`)
        
        // decryptedMessages.push({
        //   sender_id: message.sender_id,
        //   recipient_id: message.recipient_id,
        //   message: plaintext,
        //   timestamp: message.timestamp
        // });
        decryptedMessage = ({
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          message: plaintext,
          timestamp: message.timestamp
        })
        
        // Update saved ratchet state
        const conversation = ConversationManager.loadConversation(contact_id);
        ConversationManager.saveConversation(contact_id, {
          ratchetState: ratchet.getState(),
          theirIdentityKey: conversation.theirIdentityKey,
        });
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    }

    return decryptedMessage
  }    

  return { isConnected, sendMessage };
};