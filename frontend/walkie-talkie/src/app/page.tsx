'use client'
import Image from "next/image";
import Conversations from "./Conversations";
import CurrentChat from "./CurrentChat";
import OptionsBar from './Settings';
import { useEffect, useState, useRef } from 'react';
import ProfileSettings from "./ProfileSettings";
import ProfileInfo from "./InfoProfile";
import AddPersonToGroup from "./AddingToGroup";
import Login from "./pages/auth/login/page";
import Register from "./pages/auth/registration/page";
import {useAuth} from "./AuthProvider"
import SettingsView, { AppearanceOption } from "./SettingsView";
import NotificationsSettings from "./NotificationsSettings";
import AppearanceSettings from "./AppearanceSettings";
import useWebSocket from "./webSocket";
import Theme from "./Theme";
import Fonts from "./Fonts";
import Privacy, { BlockedContacts } from "./Privacy";
import ProfilePicPrivacy from "./ProfilePicPrivacy";
import StatusPrivacy from "./StatusPrivacy";
import DisappearingMessagesView from "./DisappearingMessages";
import BlockedContactsView from "./BlockedContacts";
import CurrentChatVertical from "./CurrentChatVertical";
import ConversationsVertical from "./ConversationsVertical";
import OptionsBarVerticalView from "./OptionsBarVerticalView";
import SettingsViewVertical from "./SettingsViewVertical";
import PrivacyVertical from "./PrivacyVertical";
import NotificationsSettingsVertical from "./NotificationsSettingsVertical";
import AppearanceSettingsVertical from "./AppearanceSettingsVertical";
import StatusPrivacyVertical from "./StatusPrivacyVertical";
import ProfilePicPrivacyVertical from "./ProfilePicPrivacyVertical";
import DisappearingMessagesViewVertical from "./DisappearingMessagesVertical";
import BlockedContactsViewVertical from "./BlockedContactsVertical";
import ProfileInfoVertical from "./InfoProfileVertical";
import ProfileSettingsVertical from "./ProfileSettingsVertical";
import ThemeVertical from "./ThemeVertical";
import FontsVertical from "./FontsVertical";
import AddPersonToGroupVertical from "./AddingToGroupVertical";
import { useX3DH } from "./useX3DH";
import {ConversationManager} from "./ConversationManager";
import { DoubleRatchet } from "./DoubleRatchet";
import { X3DHClient } from "./x3dh-client";
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export default function Home() {

  const [user, setUser] = useState("");
  const [userObj, setUserObj] = useState(null);
  const [users, updateUsers] = useState([]);  // Change state to an array instead of object
  const [contacts, updateContacts] = useState([]);
  const [images, updateImages] = useState([]);
  const [pressed, setPressed] = useState(null) // this is the id of the user 
  const [curr_contact, setCurrContact] = useState(null)
  const [pressedProfile, setPressProfile] = useState(false)
  const [pressedAppearance, setPressAppearance] = useState(false)
  const [pressedAccount, setPressAccount] = useState(false)
  const [pressedNotifications, setPressNotifications] = useState(false)
  
  const [profileInfo, setProfileInfo] = useState(false)
  const [addingToGroup, setAddToGroup] = useState(false)
  const [pressedSettings, setPressedSettings] = useState(false)
  const {loggedIn, registered, setLoggedIn, setRegistered} = useAuth()

  // this is when we are looking at AddContacts and we press on one to text
  const [potentialContact, setPotentialContact] = useState(null);
  const prevPotentialContact = useRef(null);

  const [addContact2, setAddContact2] = useState(false);


  /* DECRYPTED CONTACTS */
  const [decryptedContacts, setDecryptedContacts] = useState([])

  /* END DECRYPTED CONTACTS */




  /* NOTIFICATIONS */   
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [incomingSoundsEnabled, setIncomingSoundsEnabled] = useState(false);
  const [incomingSoundsEnabledPending, setIncomingSoundsEnabledPending] = useState(false);

  const [outgoingMessagesSoundsEnabled, setOutgoingMessagesSoundsEnabled] = useState(false);
  const [outgoingMessagesSoundsEnabledPending, setOutgoingMessagesSoundsEnabledPending] = useState(false);
  /* END NOTIFICATIONS */

  /* APPEARANCE */
  const [themePressed, setThemePressed] = useState(false)
  const [fontPressed, setFontPressed] = useState(false)

  const [themeChosen, setThemeChosen] = useState("Dark")
  const [themeChosenPending, setThemeChosenPending] = useState("Dark")
  const [fontChosen, setFontChosen] = useState("Sans")
  const [fontChosenPending, setFontChosenPending] = useState("Sans")
  /* END APPEARANCE */

  /* PRIVACY */
  const [pressedPrivacy, setPressPrivacy] = useState(false)

  const [profilePicPrivPress, setProfilePicPrivPress] = useState(false)
  const [statusPrivPress, setStatusPrivPress] = useState(false)

  const [visibilityProfilePic, setVisibilityProfilePic] = useState("Everyone")
  const [visibilityStatus, setVisibilityStatus] = useState("Everyone")


  const [disappearingMessagesPressed, setDisappearingMessagesPressed] = useState(false)
  const [disappearingMessagesPeriod, setDisappearingMessagesPeriod] = useState("Off")

  const [blockedContactsPressed, setBlockedContactsPressed] = useState(false)
  const [blockedContacts, setBlockedContacts] = useState([])
  /* END PRIVACY */
  
  const [ messages, setMessages] = useState([]); // Store received messages
  const messagesRef = useRef(null)
  // Only initialize WebSocket when user is valid (not -1 and not null)

  const [display, setDisplay] = useState("Desktop");

  const [windowDimensions, setWindowDimensions] = useState<{width: number, height: number}>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });


  useEffect(() => {
    if(loggedIn || !addContact2) {
      fetchData()
      console.log("user = " + user)
      fetchData2()
      fetchImages()
    }
  }, [loggedIn, addContact2])

  useEffect(() => {
    console.log("registered changed to = " + JSON.stringify(registered));
  }, [registered])
  
  let image_path = "./images/userProfile2.jpg"

  const setRegisteredAsync = async () => {
    setRegistered()
  }

  const fetchData = async () => {
      const response = await fetch('http://localhost:3002/users'); // gets all users (need this for when adding contacts)
      const result = await response.json();
      updateUsers(result);
      // console.log(result);
    };

  const fetchData2 = async () => {
      const response = await fetch(`http://localhost:3002/contacts?user=${user}`); // gets contacts of current user
      const result = await response.json();
      updateContacts(result);
      setDecryptedContacts(result);
      // console.log("contacts = " + JSON.stringify(result));
    };

  const fetchImages = async () => {
      const response = await fetch(`http://localhost:3002/images`); // Gets all images (TODO images of all contacts and users)
      const result = await response.json();
      updateImages(result);
      // console.log(result);
    };


  const { identityKey, signedPreKey, isKeysLoaded, generateKeysForSignup,
          loadKeysAfterLogin, initiateChat, setIdentityKey, setSignedPreKey,
          setOneTimePreKeys, encryptKeys, decryptKeys, clearKeys} = useX3DH(); // Xtended Diffie-Hellman for end-to-end encryption 

    // Returns Uint8Array (not CryptoKey)
  async function getOrCreateDeviceKey(userId: string): Promise<Uint8Array> {
    console.log("In getOrCreateDeviceKey for user:", userId);
    
    if (!userId) {
      throw new Error("userId is required to get/create device key");
    }
    
    const storedKey = await loadDeviceKeyFromIndexedDB(userId);
    console.log(`STORED KEY for user ${userId}:`, storedKey);
    
    if (storedKey) return storedKey;
    
    console.log("there's no key so we create one for user:", userId);
    // Create brand new 32-byte key for NaCl
    const newKey = nacl.randomBytes(32); // NaCl secretbox needs 32 bytes
    await storeDeviceKeyInIndexedDB(userId, newKey);
    console.log("After storing key in indexedDB for user:", userId);
    return newKey;
  }

  async function storeDeviceKeyInIndexedDB(userId: string, key: Uint8Array): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("cryptoKeys", "readwrite");
      const store = tx.objectStore("cryptoKeys");
      // ✅ Store with user-specific key
      store.put(key, `deviceKey_${userId}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadDeviceKeyFromIndexedDB(userId: string): Promise<Uint8Array | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("cryptoKeys", "readonly");
      const store = tx.objectStore("cryptoKeys");
      // ✅ Load with user-specific key
      const request = store.get(`deviceKey_${userId}`);
      request.onsuccess = () => {
        const key = request.result;
        resolve(key ? new Uint8Array(key) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MySecureKeyDB", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("cryptoKeys")) {
          db.createObjectStore("cryptoKeys");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function cryptoKeyToBase64(key: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  }

  async function base64ToCryptoKey(str: string): Promise<CryptoKey> {
    const binary = atob(str);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

    return crypto.subtle.importKey(
        "raw",
        bytes,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
  }

  async function trySSO() {

    console.log("In try SSO")

    const res = await fetch(`http://localhost:3002/verify`, {
        method: "GET",
        credentials: "include",
      }
    )

    const data = await res.json()

    if (res.ok) {
      console.log("✅ Token is valid:", data);
      setUser(data.user.user.id)
      if(!loggedIn) setLoggedIn()
      
      const deviceKey = await getOrCreateDeviceKey(data.user.user.id)

      console.log("Before loadKeysAfterLogin SSO")
      // const deviceKeyString = await cryptoKeyToBase64(deviceKey);
      loadKeysAfterLogin(data.user.user.id, deviceKey)

      console.log("Keys loaded after login")

      return true;
    } else {
      console.log("❌ Invalid token:", data);
      return false;
    }
  }

  useEffect(() => {
    console.log(`User has id ${user}`)

    const checkKeys = async () => {
      // Check localStorage
      const encryptedKeys = localStorage.getItem(`encrypted_keys_${user}`);
      console.log("🔍 Bob's encrypted keys in localStorage:", encryptedKeys ? "EXISTS" : "NOT FOUND");

      if (encryptedKeys) {
        try {
          const deviceKey = await getOrCreateDeviceKey(user);
          const keys = decryptKeys(encryptedKeys, deviceKey);
          console.log("📦 Bob's keys from localStorage:");
          console.log("  - Identity public:", keys.identityKey.publicKey.substring(0, 30) + "...");
          console.log("  - SignedPreKey public:", keys.signedPreKey.publicKey.substring(0, 30) + "...");
        } catch (e) {
          console.error("❌ Failed to decrypt Bob's keys:", e);
        }
      }

      // Check database
      const dbResponse = await fetch(`http://localhost:3002/api/keys?recipient_id=${user}`);
      const dbKeys = await dbResponse.json();
      console.log("🗄️ Bob's keys from database:");
      console.log("  - Identity public:", dbKeys.identityKey.substring(0, 30) + "...");
      console.log("  - SignedPreKey public:", dbKeys.signedPreKey.public_key.substring(0, 30) + "...");
    }

    if(user !== "") {
      checkKeys()


      fetchData()
      fetchData2()
      fetchImages()
    } else {

    }
  }, [user])

  useEffect(() => {
    console.log(`identityKey = ${JSON.stringify(identityKey)}, signedPreKey = ${JSON.stringify(signedPreKey)}`)
  }, [identityKey, signedPreKey])

  useEffect(() => {
    if(user !== "" && users.length !== 0) {

      const user_0 = users.find((elem) => {
        return user === elem.id
      })
      
      setUserObj(user_0)
    }
  }, [user, users])

  useEffect(() => {
    if(userObj !== null && userObj !== undefined) {
      setVisibilityProfilePic(userObj.profile_pic_visibility)
      setVisibilityStatus(userObj.status_visibility)
      setDisappearingMessagesPeriod(userObj.disappearing_message_period)
    } else {
      setVisibilityProfilePic("Everyone")
      setVisibilityStatus("Everyone")
      setDisappearingMessagesPeriod("Off")
    }
  }, [userObj])

  // gets the users
  useEffect(() => {

    /* First check with SSO if we have a token by SENDING A REQUEST */ 
    const sso_result = trySSO();
    // if(sso_result === true) {

    // }


    // Function to fetch data

    console.log("Logged in = " + loggedIn + " registered = " + registered)

    if(user) {
      fetchData()
      fetchData2()
      fetchImages()
    }

    console.log("user = " + user)

  }, []); // Empty dependency array ensures this effect runs only once (on mount)

  useEffect(() => { 
    console.log("===================================")
    console.log("In decrypted contacts: ")
    for(var i = 0; i < decryptedContacts.length; i++) {
      console.log(JSON.stringify(decryptedContacts[i]))
    }

    if(curr_contact) {
      for(var i = 0; i < decryptedContacts.length; i++) {
        if(decryptedContacts[i].id === curr_contact.id) {
          setCurrContact(decryptedContacts[i])
          console.log(`current contact set to: ${JSON.stringify(decryptedContacts[i])}`)
        }
      }
    }
    console.log("===================================")
  }, [decryptedContacts, curr_contact])

  // Separate useEffect for handling window resize
  useEffect(() => {

    function handleResize() {
      if (typeof window === 'undefined') return; // Guard clause
      
      setWindowDimensions({
        "width": window.innerWidth,
        "height": window.innerHeight
      })    
      
      if(window.innerWidth < window.innerHeight && window.innerWidth < 760) {
        setDisplay("Mobile")
        console.log("display set to mobile")
      } else {
        setDisplay("Desktop")
        console.log("desktop set to mobile")
      }
    }
    
    // Set initial dimensions (only on client side)
    if (typeof window !== 'undefined') {
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
    }
  
  // Cleanup function to remove listener when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    }
  }, []);

  useEffect(() => {
    // console.log("images = " + JSON.stringify(images))
  }, [images])

  async function logOutNow() {
    try {
        const res = await fetch("http://localhost:3002/logout", {
            method: 'GET',
            credentials: "include",
        });
        
        if(res.ok) {
            updateUsers([]);
            updateContacts([]);
            updateImages([]);
            setUser("");
            setCurrContact(null)
        }

    } catch (err) {
        console.error(JSON.stringify(err))
    }
  } 
  // Derive a 32-byte key from password using NaCl hash
  function deriveKeyFromPassword(password: string): Uint8Array {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    // Use nacl.hash to create a 64-byte hash, then take first 32 bytes for key
    const hash = nacl.hash(passwordBytes);
    return hash.slice(0, 32); // NaCl secretbox needs 32-byte key
  }

  
  // function encryptKeys(keys: any, password: string): string {
  //   // Derive encryption key from password
  //   const encryptionKey = deriveKeyFromPassword(password);
    
  //   // Convert keys object to JSON string, then to bytes
  //   const plaintext = JSON.stringify(keys);
  //   const encoder = new TextEncoder();
  //   const plaintextBytes = encoder.encode(plaintext);
    
  //   // Generate random nonce (24 bytes for secretbox)
  //   const nonce = nacl.randomBytes(24);
    
  //   // Encrypt with NaCl secretbox
  //   const ciphertext = nacl.secretbox(plaintextBytes, nonce, encryptionKey);
    
  //   // Combine nonce + ciphertext
  //   const combined = new Uint8Array(nonce.length + ciphertext.length);
  //   combined.set(nonce, 0);
  //   combined.set(ciphertext, nonce.length);
    
  //   // Encode as base64
  //   return encodeBase64(combined);
  // }

  // function decryptKeys(encryptedKeysBase64: string, password: string): any {
  //   // Derive the same encryption key from password
  //   const encryptionKey = deriveKeyFromPassword(password);
    
  //   // Decode base64
  //   const combined = decodeBase64(encryptedKeysBase64);
    
  //   // Extract nonce (first 24 bytes) and ciphertext (rest)
  //   const nonce = combined.slice(0, 24);
  //   const ciphertext = combined.slice(24);
    
  //   // Decrypt with NaCl secretbox
  //   const plaintextBytes = nacl.secretbox.open(ciphertext, nonce, encryptionKey);
    
  //   if (!plaintextBytes) {
  //     throw new Error('Decryption failed - wrong password or corrupted data');
  //   }
    
  //   // Convert bytes back to string and parse JSON
  //   const decoder = new TextDecoder();
  //   const plaintext = decoder.decode(plaintextBytes);
    
  //   return JSON.parse(plaintext);
  // }

  /* UPDATE THE CLOSE TIME of the chat */
  async function closeChat(contact) {
    
    let body = {
      "curr_user": user,
      "contact": contact,
      "exited_at": new Date().toISOString()
    }

    try { 
      const resp = await fetch(`http://localhost:3002/closeChat`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      if(resp.ok) {
        console.log("We have updated the closing of the chat")
      } else {
        // IDK???
      }

    } catch(err) {
      console.log(`Could not update closing time of chat: ${err}`)
    }
  }

    // Decrypt messages for all contacts asynchronously
  const decryptAllMessages = async () => {
    
    const updatedContacts = await Promise.all(
      contacts.map(async (contact, idx) => {
        try {

          const contact_id = contact.sender_id === user ? contact.contact_id : contact.sender_id
          console.log(`Working on contact ${idx}`)

          const decryptedMessage = await loadConversationMessages(
            contact.message, 
            contact.is_group, 
            contact_id,
            contact
          );
          
          console.log(`Conversation messages loaded`)
          
          return {
            ...contact,
            message: decryptedMessage
          };
        } catch (error) {
          console.error(`Failed to decrypt messages for contact ${contact.contact_id}:`, error);
          return contact; // Return original contact if decryption fails
        }
      })
    );
    
    setDecryptedContacts(updatedContacts)
  };

  useEffect(() => {
    if(contacts.length > 0 && userObj !== null) {
      setBlockedContacts(contacts.filter((elem) => elem.blocked === true))
      
      // if(identityKey && signedPreKey) {
      //   decryptAllMessages();
      // }
    }
  }, [contacts, userObj])

  // by contact_id we refer to user_id/group with whom we have conversation
  async function sendMessageStatusUpdate(timestamp: any, status: string, contact_id: string) {

    const req_params = {
      "user_id": user,
      "contact_id": contact_id,
      "timestamp": timestamp,
      "status": status
    };

    const response = await fetch(`http://localhost:3002/updateMessageStatus`, { 
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req_params)
    })

    if(response.status === 200) {
      console.log(`Status updated successfully to ${status} for timestamp ${timestamp}`)
    } else {
      console.error(`Failed to update message status to ${status} for timestamp ${timestamp}`)
    }
  }

  useEffect(() => {

    console.log(`identityKey = ${JSON.stringify(identityKey)}, signedPreKey = ${JSON.stringify(signedPreKey)}`)

    if(identityKey && signedPreKey) {
      console.log("DECRYPTING ALL MESSAGES")
      decryptAllMessages();
    }
  }, [identityKey, signedPreKey, contacts])

  // Client-side: Load conversation history 
  // 
  // Different cases for groups and users
  async function loadConversationMessages(messages: [any], is_group: boolean, contact_id: string, contact: any) {
    // Fetch encrypted messages from DB
    console.log("In load conversation messages")
     
    let ratchet = null;
    const decryptedMessages = [];
    const decryption_key = X3DHClient.getOrCreateLocalKey();

    const convo_w_contact = localStorage.getItem(`conversation_${user}_${contact_id}`)
    let existing_messages = convo_w_contact ? JSON.parse(convo_w_contact) : [];
    
    console.log("Before for loop")

    for (var i = 0; i < messages.length ; i++) {
        
      console.log(`message sender_id: ${messages[i].sender_id}, receiver_id: ${messages[i].recipient_id}`)
      
      if(messages[i].sender_id === user){
        if(user === contact.sender_id && messages[i].timestamp < contact.last_message_read_by_sender) {
          console.log(`we already read the message: ${JSON.stringify(existing_messages[i])}`)
          decryptedMessages.push(existing_messages[i])
          continue;
        }
      } else {
        if(user === contact.contact_id && messages[i].timestamp < contact.last_message_read_by_receiver) {
          console.log(`we already read the message: ${JSON.stringify(existing_messages[i])}`)
          decryptedMessages.push(existing_messages[i])
          continue;
        }
      }

      if (messages[i].is_first_message) {

        console.log(`message #${i}: ` + JSON.stringify(messages[i]))        
        // First message - initialize ratchet
        if (messages[i].sender_id === user) {
          console.log("We are the sender")

          // I sent this first message - load saved ratchet state
          var conversation = ConversationManager.loadConversation(contact_id);

          if (!conversation) {
            console.error('No ratchet state found for sent message');
            continue;
          }
          ratchet = new DoubleRatchet(conversation.ratchetState);
          
        } else {

          console.log("We are NOT the sender (Bob)");
          
          // Check what we're passing in
          console.log('About to perform X3DH as receiver with:');
          console.log('- ephemeralPublicKey:', messages[i].ephemeralPublicKey);
          console.log('- identityKey:', messages[i].identityKey);
          console.log('- My signedPreKey:', signedPreKey);
          console.log('- My identityKey:', identityKey);
          
          if(conversation) {
            ratchet = new DoubleRatchet(conversation.ratchetState)
          } else {
            const sharedSecret = await X3DHClient.performX3DHAsReceiver(identityKey, signedPreKey, messages[i].ephemeralPublicKey, 
                                                                        messages[i].identityKey, messages[i].oneTimePreKeyId);
            
            console.log("=== BOB AFTER X3DH ===");
            console.log("X3DH shared secret:", sharedSecret.substring(0, 30) + "...");
            console.log("My signed prekey:", signedPreKey.publicKey.substring(0, 30) + "...");
            console.log("Alice's ephemeral key:", messages[i].ephemeralPublicKey.substring(0, 30) + "...");
            console.log("Alice's identity key:", messages[i].identityKey.substring(0, 30) + "...");
            
            ratchet = DoubleRatchet.initializeAsReceiver(sharedSecret, signedPreKey);
            
            const initialState = ratchet.getState();
            console.log('Bob - Initial ratchet state RIGHT AFTER CREATION:');
            console.log('- dhReceivingKey (should be null):', initialState.dhReceivingKey);
            console.log('- dhReceivingKey type:', typeof initialState.dhReceivingKey);
            console.log('- dhSendingKey.publicKey:', initialState.dhSendingKey.publicKey);
            console.log('- Full state:', JSON.stringify(initialState, null, 2));

            // Save for future use
            ConversationManager.saveConversation(contact_id, {
              ratchetState: initialState,
              theirIdentityKey: messages[i].identityKey,
            });
            
            // Immediately load back to check if it's saved correctly
            const reloaded = ConversationManager.loadConversation(contact_id);
            console.log('RELOADED state from storage:');
            console.log('- dhReceivingKey after reload:', reloaded.ratchetState.dhReceivingKey);
            console.log('- dhReceivingKey type after reload:', typeof reloaded.ratchetState.dhReceivingKey);
            console.log("loadConversations called with contact_id:", contact_id);
          }
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
          if(user === messages[i].sender_id) {
            console.log("We're decrypting as Alice")
            plaintext = X3DHClient.decryptForSelf(messages[i].ciphertext_sender, decryption_key);

            sendMessageStatusUpdate(messages[i].timestamp, "read_by_sender", contact_id)
            
            /*
              HERE WE SAVE MESSAGES TO LOCAL STORAGE ENCRYPTED (we decrypt with our key)
              to an array .. 
            */
            // Get existing conversation and parse it
            const convo_til_now = localStorage.getItem(`conversation_${user}_${contact_id}`);
            let existing_messages = convo_til_now ? JSON.parse(convo_til_now) : [];

            console.log(`convo_til_now before adding new message:`, existing_messages);

            let message_details = {
              "sender_id": messages[i].sender_id,
              "recipient_id": messages[i].recipient_id,
              "message": plaintext,
              "timestamp": messages[i].timestamp
            };

            // Now spread the PARSED array
            let convo_after_dec = [...existing_messages, message_details];

            localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(convo_after_dec));

            console.log(`localStorage after adding new message in Alice:`, convo_after_dec);

          } else {
            console.log("We're decrypting as Bob")
            plaintext = ratchet.decrypt(messages[i].ciphertext, messages[i].header);
            
            /*
              HERE WE SAVE MESSAGES TO LOCAL STORAGE ENCRYPTED (we decrypt with our key)
            */

            sendMessageStatusUpdate(messages[i].timestamp, "read_by_receiver", contact_id)

            // Get existing conversation and parse it
            const convo_til_now = localStorage.getItem(`conversation_${user}_${contact_id}`);
            let existing_messages = convo_til_now ? JSON.parse(convo_til_now) : [];

            console.log(`convo_til_now before adding new message in Bob:`, existing_messages);
            
            console.log(`Before adding to localStorage... plaintext: ${plaintext}`)
            console.log(`Before adding to localStorage... timestamp: ${messages[i].timestamp}`)
            console.log(`Before adding to localStorage... sender_id: ${messages[i].sender_id}`)
            console.log(`Before adding to localStorage... recipient_id: ${messages[i].recipient_id}`)

            let message_details = {
              "sender_id": messages[i].sender_id,
              "recipient_id": messages[i].recipient_id,
              "message": plaintext,
              "timestamp": messages[i].timestamp
            };

            // Now spread the PARSED array
            let convo_after_dec = [...existing_messages, message_details];

            localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(convo_after_dec));

            console.log(`localStorage after adding new message:`, convo_after_dec);
          }

          /*
            SEND TO SERVER IT HAS BEEN DECRYPTED (update the status to "sent")
            AND STORE IN LOCAL DB, encrypted, decryptable only by us
          */


        
          console.log(`After decryption with plaintext = ${plaintext}`)
          
          decryptedMessages.push({
            sender_id: messages[i].sender_id,
            recipient_id: messages[i].recipient_id,
            message: plaintext,
            timestamp: messages[i].timestamp
          });
          
          ConversationManager.saveConversation(contact_id, {
            ratchetState: ratchet.getState(),
            theirIdentityKey: messages[i].identityKey,
          });
          
          // Update saved ratchet state
          const conversation = ConversationManager.loadConversation(contact_id);

          console.log("=====================================")
          console.log("DEBUGGING RECEIVING RATCHET INCREMENT")
          console.log(`conversation: ${JSON.stringify(conversation)}`)
          console.log("END DEBUGGING RECEIVING RATCHET INCREMENT")
          console.log("=====================================")
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
      }
    }
    
    return decryptedMessages;
  }

  useEffect(() => {
    if(userObj !== null && userObj !== undefined) {
      if(userObj.theme) {
        setThemeChosen(userObj.theme); setThemeChosenPending(userObj.theme)
      } else {      
        setThemeChosen("Dark"); setThemeChosenPending("Dark")
      }
      
      if(userObj.font) {
        setFontChosen(userObj.font); setFontChosenPending(userObj.font);
      } else {
        setFontChosen("Sans"); setFontChosenPending("Sans")
      }

      if(userObj.incoming_sounds) {
        setIncomingSoundsEnabled(userObj.incoming_sounds); 
      } else {
        setIncomingSoundsEnabled(false); 
      }
      
      if(userObj.outgoing_sounds) {
        setOutgoingMessagesSoundsEnabled(userObj.outgoing_sounds); 
      } else {
        setOutgoingMessagesSoundsEnabled(false); 
      } 

      if(userObj.notifications_enabled) {
        setNotificationsEnabled(userObj.notifications_enabled); 
      } else {
        setNotificationsEnabled(false); 
      } 
    } else {
      setThemeChosen("Dark"); setThemeChosenPending("Dark")
      setFontChosen("Sans"); setFontChosenPending("Dark")
      setIncomingSoundsEnabled(false); 
      setOutgoingMessagesSoundsEnabled(false); 
      setNotificationsEnabled(false); 
    }
      
  }, [userObj])

  const { isConnected, sendMessage } = useWebSocket(
    user !== "" && user !== null ? `ws://localhost:8080?userId=${user}` : null, 
    user,
    contacts,
    updateContacts, 
    setDecryptedContacts,
    identityKey,
    signedPreKey,
    setMessages,
    incomingSoundsEnabled,
    outgoingMessagesSoundsEnabled,
    decryptAllMessages,
    fetchData2
  );

  // useEffect(() => {
  //   fetchData2()
  // }, [messages])

  return (
    <div className="absolute left-0 top-0 w-full h-full">
      <div className={`relative left-0 top-0 w-full h-full flex flex-row ${themeChosen === "Dark" ? "bg-[#101D42]" : "bg-slate-400"} ${(addingToGroup === true) ? 'blur-sm' : 'blur-none'}`}>
        {themePressed ? (display === "Desktop" ? <Theme curr_user={user} userObj={userObj} fetchUsers={fetchData} themePressed={themePressed} setThemePressed={setThemePressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen} themeChosenPending={themeChosenPending} setThemeChosenPending={setThemeChosenPending}
                        ></Theme> : <ThemeVertical curr_user={user} userObj={userObj} fetchUsers={fetchData} themePressed={themePressed} setThemePressed={setThemePressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen} themeChosenPending={themeChosenPending} setThemeChosenPending={setThemeChosenPending}
                        ></ThemeVertical>) : <></>}
        {fontPressed ? (display === "Desktop" ? <Fonts curr_user={user} userObj={userObj} fetchUsers={fetchData} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen} fontChosenPending={fontChosenPending} setFontChosenPending={setFontChosenPending}
                        ></Fonts> : <FontsVertical curr_user={user} userObj={userObj} fetchUsers={fetchData} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen} fontChosenPending={fontChosenPending} setFontChosenPending={setFontChosenPending}
                        ></FontsVertical>) : <></>}
        {loggedIn === true && <div className={`relative left-0 top-0 w-full h-full flex flex-row bg-[#101D42] ${(themePressed || fontPressed) ? 'blur-sm' : 'blur-none'}`}>
          {/* {themePressed ? <div className="absolute left-0 top-0 w-full h-full bg-"></div> : <></>} */}
          {display === "Mobile" && <OptionsBarVerticalView curr_user={user} users={users} images={images} setPressProfile={setPressProfile} pressedSettings={pressedSettings} 
                                    setPressedSettings={setPressedSettings} themeChosen={themeChosen} setPressAccount={setPressAccount} setPressPrivacy={setPressPrivacy} setDisappearingMessagesPressed={setDisappearingMessagesPressed}
                                    setStatusPrivPress={setStatusPrivPress} setProfilePicPrivPress={setProfilePicPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} setPressNotifications={setPressNotifications}
                                    setPressAppearance={setPressAppearance} setCurrContact={setCurrContact} setProfileInfo={setProfileInfo}
                                    ></OptionsBarVerticalView>}
          {display === "Desktop" ? <OptionsBar curr_user={user} users={users} images={images} setPressProfile={setPressProfile} pressedSettings={pressedSettings} setPressedSettings={setPressedSettings} themeChosen={themeChosen}></OptionsBar> : <></>}
          {pressedProfile ? (display === "Desktop" ? <ProfileSettings users={users} curr_user={user} images={images} setPressProfile={setPressProfile} fetchData={fetchData} 
                                          fetchData2={fetchData2} fetchImages={fetchImages} addingToGroup={addingToGroup} themeChosen={themeChosen} setPressedSettings={setPressedSettings} setPressPrivacy={setPressPrivacy}
                                          setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} 
                                          userObj={userObj} user={user}  fetchUsers={fetchData} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setProfilePicPrivPress={setProfilePicPrivPress} visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus} 
                                      setDisappearingMessagesPeriod={setDisappearingMessagesPeriod} setDisappearingMessagesPressed={setDisappearingMessagesPressed} 
                                      setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} ></ProfileSettings>
                                                   : <ProfileSettingsVertical users={users} curr_user={user} images={images} setPressProfile={setPressProfile} fetchData={fetchData} 
                                          fetchData2={fetchData2} fetchImages={fetchImages} addingToGroup={addingToGroup} themeChosen={themeChosen} setPressedSettings={setPressedSettings} setPressPrivacy={setPressPrivacy}
                                          setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} 
                                          userObj={userObj} user={user}  fetchUsers={fetchData} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setProfilePicPrivPress={setProfilePicPrivPress} visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus} 
                                      setDisappearingMessagesPeriod={setDisappearingMessagesPeriod} setDisappearingMessagesPressed={setDisappearingMessagesPressed} 
                                      setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed}
                                          
                                          
                                          ></ProfileSettingsVertical>)
                                   :                 
            pressedSettings ? (display === "Desktop" ? <SettingsView curr_user={user} setPressedSettings={setPressedSettings} setPressProfile={setPressProfile} setProfilePicPrivPress={setProfilePicPrivPress} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance}
                                  users={users} images={images} logOutNow={logOutNow} setLoggedIn={setLoggedIn} loggedIn={loggedIn} setPressPrivacy={setPressPrivacy} setStatusPrivPress={setStatusPrivPress}
                                  setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed} themeChosen={themeChosen}
                              ></SettingsView> : <SettingsViewVertical curr_user={user} setPressedSettings={setPressedSettings} setPressProfile={setPressProfile} setProfilePicPrivPress={setProfilePicPrivPress} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance}
                                  users={users} images={images} logOutNow={logOutNow} setLoggedIn={setLoggedIn} loggedIn={loggedIn} setPressPrivacy={setPressPrivacy} setStatusPrivPress={setStatusPrivPress}
                                  setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed} themeChosen={themeChosen}
                              ></SettingsViewVertical>)
                                   :
            pressedNotifications ? (display === "Desktop" ? <NotificationsSettings userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance}  setPressedSettings={setPressedSettings} 
                                        setNotificationsEnabled={setNotificationsEnabled} notificationsEnabled={notificationsEnabled} incomingSoundsEnabled={incomingSoundsEnabled} setIncomingSoundsEnabled={setIncomingSoundsEnabled}
                                        outgoingMessagesSoundsEnabled={outgoingMessagesSoundsEnabled} setOutgoingMessagesSoundsEnabled={setOutgoingMessagesSoundsEnabled}
                                        incomingSoundsEnabledPending={incomingSoundsEnabledPending} setIncomingSoundsEnabledPending={setIncomingSoundsEnabledPending} setPressNotifications={setPressNotifications}
                                        outgoingMessagesSoundsEnabledPending={outgoingMessagesSoundsEnabledPending} setOutgoingMessagesSoundsEnabledPending={setOutgoingMessagesSoundsEnabledPending} 
                                        fetchUsers={fetchData} users={users} updateUsers={updateUsers} setUserObj={setUserObj} themeChosen={themeChosen}
                                        ></NotificationsSettings> : <NotificationsSettingsVertical userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance}  setPressedSettings={setPressedSettings} 
                                        setNotificationsEnabled={setNotificationsEnabled} notificationsEnabled={notificationsEnabled} incomingSoundsEnabled={incomingSoundsEnabled} setIncomingSoundsEnabled={setIncomingSoundsEnabled}
                                        outgoingMessagesSoundsEnabled={outgoingMessagesSoundsEnabled} setOutgoingMessagesSoundsEnabled={setOutgoingMessagesSoundsEnabled}
                                        incomingSoundsEnabledPending={incomingSoundsEnabledPending} setIncomingSoundsEnabledPending={setIncomingSoundsEnabledPending} setPressNotifications={setPressNotifications}
                                        outgoingMessagesSoundsEnabledPending={outgoingMessagesSoundsEnabledPending} setOutgoingMessagesSoundsEnabledPending={setOutgoingMessagesSoundsEnabledPending} 
                                        fetchUsers={fetchData} users={users} updateUsers={updateUsers} setUserObj={setUserObj} themeChosen={themeChosen}
                                        ></NotificationsSettingsVertical>)
                                    :
            pressedAppearance ? (display === "Desktop" ? <AppearanceSettings userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} setPressedSettings={setPressedSettings} 
                                                    themePressed={themePressed} setThemePressed={setThemePressed} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} fontChosen={fontChosen}
                                        ></AppearanceSettings> : <AppearanceSettingsVertical userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} setPressedSettings={setPressedSettings} 
                                                    themePressed={themePressed} setThemePressed={setThemePressed} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} fontChosen={fontChosen}
                                        ></AppearanceSettingsVertical>)
                                    :
            pressedPrivacy ? (display === "Desktop" ? <Privacy userObj={userObj} user={user} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setProfilePicPrivPress={setProfilePicPrivPress} setStatusPrivPress={setStatusPrivPress} 
                                      setDisappearingMessagesPressed={setDisappearingMessagesPressed} disappearingMessagesPeriod={disappearingMessagesPeriod} 
                                      disappearingMessagesPressed={disappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed} visibilityStatus={visibilityStatus}
                                      visibilityProfilePic={visibilityProfilePic} themeChosen={themeChosen}></Privacy> : <PrivacyVertical userObj={userObj} user={user} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setProfilePicPrivPress={setProfilePicPrivPress} setStatusPrivPress={setStatusPrivPress} 
                                      setDisappearingMessagesPressed={setDisappearingMessagesPressed} disappearingMessagesPeriod={disappearingMessagesPeriod} 
                                      disappearingMessagesPressed={disappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed} visibilityStatus={visibilityStatus}
                                      visibilityProfilePic={visibilityProfilePic} themeChosen={themeChosen}></PrivacyVertical>)
                                    : 
            profilePicPrivPress ? (display === "Desktop" ? <ProfilePicPrivacy userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} setStatusPrivPress={setStatusPrivPress} setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed}
                                      visibilityProfilePic={visibilityProfilePic} setVisibilityProfilePic={setVisibilityProfilePic} setPressProfile={setPressProfile} themeChosen={themeChosen}></ProfilePicPrivacy> 
                                        : <ProfilePicPrivacyVertical userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} setStatusPrivPress={setStatusPrivPress} setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed}
                                      visibilityProfilePic={visibilityProfilePic} setVisibilityProfilePic={setVisibilityProfilePic} setPressProfile={setPressProfile} themeChosen={themeChosen}></ProfilePicPrivacyVertical>)
                                      
                                    :
            statusPrivPress ? (display === "Desktop" ? <StatusPrivacy userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus} 
                                      setDisappearingMessagesPeriod={setDisappearingMessagesPeriod} setDisappearingMessagesPressed={setDisappearingMessagesPressed} 
                                      setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} setPressProfile={setPressProfile} themeChosen={themeChosen}
                                      ></StatusPrivacy> : <StatusPrivacyVertical userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} visibilityStatus={visibilityStatus} setVisibilityStatus={setVisibilityStatus} 
                                      setDisappearingMessagesPeriod={setDisappearingMessagesPeriod} setDisappearingMessagesPressed={setDisappearingMessagesPressed} 
                                      setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} setPressProfile={setPressProfile} themeChosen={themeChosen}
                                      ></StatusPrivacyVertical>)
                                    :
            disappearingMessagesPressed ? (display === "Desktop" ? <DisappearingMessagesView userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} disappearingMessagesPeriod={disappearingMessagesPeriod} setDisappearingMessagesPeriod={setDisappearingMessagesPeriod}
                                      setDisappearingMessagesPressed={setDisappearingMessagesPressed} setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      setPressProfile={setPressProfile} themeChosen={themeChosen}
                                      ></DisappearingMessagesView> : <DisappearingMessagesViewVertical userObj={userObj} user={user} users={users} fetchUsers={fetchData} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} disappearingMessagesPeriod={disappearingMessagesPeriod} setDisappearingMessagesPeriod={setDisappearingMessagesPeriod}
                                      setDisappearingMessagesPressed={setDisappearingMessagesPressed} setStatusPrivPress={setStatusPrivPress} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      setPressProfile={setPressProfile} themeChosen={themeChosen}
                                      ></DisappearingMessagesViewVertical>)
                                    :
            blockedContactsPressed ? (display === "Desktop" ? <BlockedContactsView userObj={userObj} user={user} users={users} fetchUsers={fetchData} fetchContacts={fetchData2} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed}
                                      images={images} themeChosen={themeChosen}></BlockedContactsView> : <BlockedContactsViewVertical userObj={userObj} user={user} users={users} fetchUsers={fetchData} fetchContacts={fetchData2} setPressPrivacy={setPressPrivacy} setPressedSettings={setPressedSettings} blockedContacts={blockedContacts}
                                      setBlockedContacts={setBlockedContacts} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance} 
                                      setProfilePicPrivPress={setProfilePicPrivPress} setDisappearingMessagesPressed={setDisappearingMessagesPressed} setBlockedContactsPressed={setBlockedContactsPressed}
                                      images={images} themeChosen={themeChosen}></BlockedContactsViewVertical>)
                                    :
            
            curr_contact !== null && profileInfo === true && display === "Mobile" ? <ProfileInfoVertical users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} setAddToGroup={setAddToGroup}
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage} fontChosen={fontChosen} themeChosen={themeChosen} setCurrContact={setCurrContact}></ProfileInfoVertical> 
                                    :
            curr_contact !== null && profileInfo === false && display === "Mobile" ? <CurrentChatVertical users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} 
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage} fontChosen={fontChosen} themeChosen={themeChosen} setCurrContact={setCurrContact}></CurrentChatVertical> 
                                    :
            (display === "Desktop" ? <Conversations users={users} contacts={contacts} blockedContacts={blockedContacts} setBlockedContacts={setBlockedContacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact} setAddContact2={setAddContact2}
                                      updateImages={updateImages} updateContacts={updateContacts} updateUsers={updateUsers} setUser={setUser} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      closeChat={closeChat} themeChosen={themeChosen} pressedSettings={pressedSettings} pressedProfile={pressedProfile} decryptAllMessages={decryptAllMessages} decryptedContacts={decryptedContacts}></Conversations> : <ConversationsVertical users={users} contacts={contacts} blockedContacts={blockedContacts} setBlockedContacts={setBlockedContacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact} setAddContact2={setAddContact2}
                                      updateImages={updateImages} updateContacts={updateContacts} updateUsers={updateUsers} setUser={setUser} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      closeChat={closeChat} themeChosen={themeChosen} setPressedSettings={setPressedSettings} pressedSettings={pressedSettings} pressedProfile={pressedProfile} decryptAllMessages={decryptAllMessages} 
                                      decryptedContacts={decryptedContacts}></ConversationsVertical>)
          }
          {profileInfo === false ? (display === "Desktop" ? <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} fetchContacts={fetchData2}
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage} fontChosen={fontChosen} themeChosen={themeChosen} initiateChat={initiateChat}
                                                identityKey={identityKey} signedPreKey={signedPreKey} decryptAllMessages={decryptAllMessages} decryptedContacts={decryptedContacts}></CurrentChat> : <></>)
                                : (display === "Desktop" ? <ProfileInfo setProfileInfo={setProfileInfo} contact={curr_contact} users={users} curr_user={user} contacts={contacts} images={images} fetchContacts={fetchData2} fetchUsers={fetchData} 
                                      fetchImages={fetchImages} setCurrContact={setCurrContact} setAddToGroup={setAddToGroup} addingToGroup={addingToGroup} themeChosen={themeChosen}></ProfileInfo> : <></>) }
        </div>
        }
        {(registered === true && loggedIn === false) ? <Login users={users} setU={setUser} setRegisteredAsync={setRegisteredAsync} cryptoKeyToBase64={cryptoKeyToBase64} loadKeysAfterLogin={loadKeysAfterLogin} getOrCreateDeviceKey={getOrCreateDeviceKey}></Login> : (registered === false && loggedIn === false) ? 
                                                       <Register users={users} setRegisteredAsync={setRegisteredAsync} generateKeysForSignup={generateKeysForSignup} getOrCreateDeviceKey={getOrCreateDeviceKey} cryptoKeyToBase64={cryptoKeyToBase64} setUser={setUser} setIdentityKey={setIdentityKey} 
                                                       setSignedPreKey={setSignedPreKey} setOneTimePreKeys={setOneTimePreKeys} isKeysLoaded={isKeysLoaded} deriveKeyFromPassword={deriveKeyFromPassword} decryptKeys={decryptKeys} encryptKeys={encryptKeys}></Register> : <></>}
      </div>
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && display === "Desktop" && <AddPersonToGroup contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images} themeChosen={themeChosen}></AddPersonToGroup>}
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && display === "Mobile" && <AddPersonToGroupVertical contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images} themeChosen={themeChosen}></AddPersonToGroupVertical>}
    </div>
  );
}


