'use client'
import Image from "next/image";
import Conversations from "./desktop/Conversations";
import CurrentChat from "./desktop/CurrentChat";
import OptionsBar from './desktop/Settings';
import { useEffect, useState, useRef } from 'react';
import ProfileSettings from "./desktop/ProfileSettings";
import ProfileInfo from "./desktop/InfoProfile";
import AddPersonToGroup from "./desktop/AddingToGroup";
import Login from "./pages/auth/login/page";
import Register from "./pages/auth/registration/page";
import {useAuth} from "./AuthProvider"
import SettingsView, { AppearanceOption } from "./desktop/SettingsView";
import NotificationsSettings from "./desktop/NotificationsSettings";
import AppearanceSettings from "./desktop/AppearanceSettings";
import useWebSocket from "./webSocket";
import Theme from "./desktop/Theme";
import Fonts from "./desktop/Fonts";
import Privacy, { BlockedContacts } from "./desktop/Privacy";
import ProfilePicPrivacy from "./desktop/ProfilePicPrivacy";
import StatusPrivacy from "./desktop/StatusPrivacy";
import DisappearingMessagesView from "./desktop/DisappearingMessages";
import BlockedContactsView from "./desktop/BlockedContacts";
import CurrentChatVertical from "./mobile/CurrentChatVertical";
import ConversationsVertical from "./mobile/ConversationsVertical";
import OptionsBarVerticalView from "./mobile/OptionsBarVerticalView";
import SettingsViewVertical from "./mobile/SettingsViewVertical";
import PrivacyVertical from "./mobile/PrivacyVertical";
import NotificationsSettingsVertical from "./mobile/NotificationsSettingsVertical";
import AppearanceSettingsVertical from "./mobile/AppearanceSettingsVertical";
import StatusPrivacyVertical from "./mobile/StatusPrivacyVertical";
import ProfilePicPrivacyVertical from "./mobile/ProfilePicPrivacyVertical";
import DisappearingMessagesViewVertical from "./mobile/DisappearingMessagesVertical";
import BlockedContactsViewVertical from "./mobile/BlockedContactsVertical";
import ProfileInfoVertical from "./mobile/InfoProfileVertical";
import ProfileSettingsVertical from "./mobile/ProfileSettingsVertical";
import ThemeVertical from "./mobile/ThemeVertical";
import FontsVertical from "./mobile/FontsVertical";
import AddPersonToGroupVertical from "./mobile/AddingToGroupVertical";
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
  const hasDecryptedInitial = useRef(false);




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
      // decryptAllMessages()

      console.log("======================================")
      console.log(`=== new user: ${user} ===`)
      console.log("======================================")
      /* GET the ratchet state from DB */
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
          console.log(`Working on contact ${contact.id}, as user: ${user}`)

          const decryptedMessages = await loadConversationMessages(
            contact.message, 
            contact.is_group, 
            contact_id,
            contact
          );
          
          console.log(`Conversation messages loaded`)
          console.log(`Exited working on contact ${contact.id}, as user: ${user}`)
         
          
          return {
            ...contact,
            message: decryptedMessages
          };
        } catch (error) {
          console.error(`Failed to decrypt messages for contact ${contact.contact_id}:`, error);
          return contact; // Return original contact if decryption fails
        }
      })
    );
    
    console.log(`decrypted contacts should be set to = ${JSON.stringify(updatedContacts)}`)
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

    if(identityKey && signedPreKey && user && contacts.length > 0 && !hasDecryptedInitial.current) {
      console.log("DECRYPTING ALL MESSAGES")

      /* debugging here*/
      decryptAllMessages();

      hasDecryptedInitial.current = true
    }
  }, [identityKey, signedPreKey, user, contacts.length])

  async function loadConversationRatchetStateDB(user, contact) {
    var conversation = null
    var  ratchet = null
    try {

      const response = await fetch(
        `http://localhost:3002/getRatchetState?user_id=${user}&conversation_id=${contact.id}`
      );
    
      if (response.ok) {
        const serverState = await response.json();
        console.log('Loaded ratchet state from SERVER:', serverState);
        
        conversation = {
          ratchetState: {
            user: serverState.user_id,
            conversation_id: serverState.conversation_id,
            rootKey: serverState.root_key,
            sendingChainKey: serverState.send_chain_key,
            receivingChainKey: serverState.receive_chain_key,
            dhSendingKey: JSON.parse(serverState.dh_sending_key),
            dhReceivingKey: serverState.dh_receiving_key || null,
            sendMessageNumber: serverState.send_message_number,
            receiveMessageNumber: serverState.receive_message_number,
            previousSendingChainLength: serverState.previous_sending_chain_length
          },
          theirIdentityKey: messages[0]?.identityKey // or store this in DB too
        };
        
        ratchet = new DoubleRatchet(conversation?.ratchetState);
        console.log(`ratchet state after req: ${JSON.stringify(ratchet)}`)
        return ratchet;
      } else {
        return null
      }

    } catch (error) {
      console.log('No server state found, will initialize fresh');

      return null
    }
  }

  // Client-side: Load conversation history 
  // 
  // Different cases for groups and users
  async function loadConversationMessages(messages: [any], is_group: boolean, contact_id: string, contact: any) {
    console.log(`In load conversation messages at ${new Date()}`)

    const decryptedMessages = [];
    const decryption_key = X3DHClient.getOrCreateLocalKey();

    const convo_w_contact = localStorage.getItem(`conversation_${user}_${contact_id}`)
    let existing_messages = convo_w_contact ? JSON.parse(convo_w_contact) : [];

    var user_o = null
    if(user) {
      user_o = users.find((elem) => {elem.id === user})
    }
    
    // ✅ Load ratchet from DB
    console.log("Before load ratchet in loadConversationMessages")
    console.log(`before loading ratchet in sendMessage; curr_user: ${user}, id convo: ${contact.id}`)
    var ratchet = await loadConversationRatchetStateDB(user, contact);

    // if(!ratchet || !ratchet.state) return existing_messages

    if(ratchet && ratchet.state && user_o){
      console.log(`Ratchet ${user_o.username} with convo_id ${contact.id}: ${JSON.stringify(ratchet.getState())}`)
    }

    if(user_o){
      console.log("Before for with user")

    }

    for (var i = 0; i < messages.length; i++) {
      console.log(`message sender_id: ${messages[i].sender_id}, receiver_id: ${messages[i].recipient_id}`)

      // Skip already read messages
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

      // Handle first message
      if (messages[i].is_first_message) {
        console.log(`message #${i}: ` + JSON.stringify(messages[i]))

        if (messages[i].sender_id === user) {
          console.log("We are the sender (Alice) - ratchet already loaded from DB")
          // Ratchet already loaded from DB, no action needed
        } else {
          console.log(`We are the receiver (Bob) ${user_o.username} - initializing ratchet`);

          const sharedSecret = await X3DHClient.performX3DHAsReceiver(
            identityKey, 
            signedPreKey, 
            messages[i].ephemeralPublicKey, 
            messages[i].identityKey, 
            messages[i].oneTimePreKeyId
          );

          console.log("=== BOB AFTER X3DH ===");
          console.log("X3DH shared secret:", sharedSecret.substring(0, 30) + "...");

          ratchet = DoubleRatchet.initializeAsReceiver(user, contact.id, sharedSecret, signedPreKey);

          const initialState = ratchet.getState();
          console.log('Bob - Initial ratchet state:', JSON.stringify(initialState, null, 2));

          // ✅ Ratchet will auto-save to DB on first decrypt
        }
      }

      // Decrypt message
      if (ratchet) {
        console.log(`Ratchet exists at ${new Date()}`)
        try {
          var plaintext = ""
          
          if(user === messages[i].sender_id) {
            console.log("We're decrypting as Alice (our own sent message)")
            plaintext = X3DHClient.decryptForSelf(messages[i].ciphertext_sender, decryption_key);
            
            console.log(`plaintext: ${plaintext}`)
            sendMessageStatusUpdate(messages[i].timestamp, "read_by_sender", contact_id)

            // Save to localStorage
            const convo_til_now = localStorage.getItem(`conversation_${user}_${contact_id}`);
            let existing_messages = convo_til_now ? JSON.parse(convo_til_now) : [];

            let message_details = {
              "sender_id": messages[i].sender_id,
              "recipient_id": messages[i].recipient_id,
              "message": plaintext,
              "timestamp": messages[i].timestamp
            };

            let convo_after_dec = [...existing_messages, message_details];
            localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(convo_after_dec));

          } else {
            console.log("We're decrypting as Bob (received message)")
            plaintext = await ratchet.decrypt(messages[i].ciphertext, messages[i].header);
            // ✅ ratchet.decrypt() automatically saves updated state to DB

            console.log(`plaintext: ${plaintext}`)
            sendMessageStatusUpdate(messages[i].timestamp, "read_by_receiver", contact_id)

            // Save to localStorage
            const convo_til_now = localStorage.getItem(`conversation_${user}_${contact_id}`);
            let existing_messages = convo_til_now ? JSON.parse(convo_til_now) : [];

            let message_details = {
              "sender_id": messages[i].sender_id,
              "recipient_id": messages[i].recipient_id,
              "message": plaintext,
              "timestamp": messages[i].timestamp
            };

            let convo_after_dec = [...existing_messages, message_details];
            localStorage.setItem(`conversation_${user}_${contact_id}`, JSON.stringify(convo_after_dec));
          }

          console.log(`After decryption with plaintext = ${plaintext}`)

          decryptedMessages.push({
            sender_id: messages[i].sender_id,
            recipient_id: messages[i].recipient_id,
            message: plaintext,
            timestamp: messages[i].timestamp
          });


          // ❌ REMOVE ALL ConversationManager calls - DB handles it now
          
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
    fetchData2,
    loadConversationRatchetStateDB
  );

  // useEffect(() => {
  //   fetchData2()
  // }, [messages])

  useEffect(() => {
    console.log(`Decrypted contacts after updating: ${JSON.stringify(decryptedContacts)}`)
  }, [decryptedContacts])

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
                                      closeChat={closeChat} themeChosen={themeChosen} pressedSettings={pressedSettings} pressedProfile={pressedProfile} decryptAllMessages={decryptAllMessages} decryptedContacts={decryptedContacts}
                                      loadConversationRatchetStateDB={loadConversationRatchetStateDB}></Conversations> : 
                                      <ConversationsVertical users={users} contacts={contacts} blockedContacts={blockedContacts} setBlockedContacts={setBlockedContacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact} setAddContact2={setAddContact2}
                                      updateImages={updateImages} updateContacts={updateContacts} updateUsers={updateUsers} setUser={setUser} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      closeChat={closeChat} themeChosen={themeChosen} setPressedSettings={setPressedSettings} pressedSettings={pressedSettings} pressedProfile={pressedProfile} decryptAllMessages={decryptAllMessages} 
                                      decryptedContacts={decryptedContacts}></ConversationsVertical>)
          }
          {profileInfo === false ? (display === "Desktop" ? <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} fetchContacts={fetchData2}
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage} fontChosen={fontChosen} themeChosen={themeChosen} initiateChat={initiateChat}
                                                identityKey={identityKey} signedPreKey={signedPreKey} decryptAllMessages={decryptAllMessages} decryptedContacts={decryptedContacts} 
                                                loadConversationRatchetStateDB={loadConversationRatchetStateDB}></CurrentChat> : <></>)
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


