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

export default function Home() {

  const [user, setUser] = useState(-1);
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
  
  const { isConnected, sendMessage } = useWebSocket(
    user !== -1 && user !== null ? `ws://localhost:8080?userId=${user}` : null, 
    setMessages,
    incomingSoundsEnabled,
    outgoingMessagesSoundsEnabled,
    fetchData2
  );

  async function trySSO() {

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
    } else {
      console.log("❌ Invalid token:", data);
    }
  }

  useEffect(() => {
    console.log(`User has id ${user}`)
    if(user !== -1) {
      fetchData()
      fetchData2()
      fetchImages()
    } else {

    }
  }, [user])

  useEffect(() => {
    if(user !== -1 && users.length !== 0) {

      const user_0 = users.find((elem) => {
        return user === elem.id
      })
      
      setUserObj(user_0)
    }
  }, [user, users])

  useEffect(() => {
    if(userObj !== null || userObj === undefined) {
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
    trySSO();

    // Function to fetch data

    console.log("Logged in = " + loggedIn + " registered = " + registered)

    if(user) {
      fetchData()
      fetchData2()
      fetchImages()
    }

    console.log("user = " + user)

  }, []); // Empty dependency array ensures this effect runs only once (on mount)

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
            setUser(-1);
            setCurrContact(null)
        }

    } catch (err) {
        console.error(JSON.stringify(err))
    }
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

  useEffect(() => {
    if(contacts.length > 0 && userObj !== null) {
      setBlockedContacts(contacts.filter((elem) => elem.blocked === true))
    }
  }, [contacts, userObj])

  useEffect(() => {
    if(userObj !== null) {
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
                                      closeChat={closeChat} themeChosen={themeChosen} pressedSettings={pressedSettings} pressedProfile={pressedProfile}></Conversations> : <ConversationsVertical users={users} contacts={contacts} blockedContacts={blockedContacts} setBlockedContacts={setBlockedContacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact} setAddContact2={setAddContact2}
                                      updateImages={updateImages} updateContacts={updateContacts} updateUsers={updateUsers} setUser={setUser} setBlockedContactsPressed={setBlockedContactsPressed} 
                                      closeChat={closeChat} themeChosen={themeChosen} setPressedSettings={setPressedSettings} pressedSettings={pressedSettings} pressedProfile={pressedProfile}></ConversationsVertical>)
          }
          {profileInfo === false ? (display === "Desktop" ? <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} 
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage} fontChosen={fontChosen} themeChosen={themeChosen}></CurrentChat> : <></>)
                                : (display === "Desktop" ? <ProfileInfo setProfileInfo={setProfileInfo} contact={curr_contact} users={users} curr_user={user} contacts={contacts} images={images} fetchContacts={fetchData2} fetchUsers={fetchData} 
                                      fetchImages={fetchImages} setCurrContact={setCurrContact} setAddToGroup={setAddToGroup} addingToGroup={addingToGroup} themeChosen={themeChosen}></ProfileInfo> : <></>) }
        </div>
        }
        {(registered === true && loggedIn === false) ? <Login users={users} setU={setUser} setRegisteredAsync={setRegisteredAsync}></Login> : (registered === false && loggedIn === false) ? <Register users={users} setRegisteredAsync={setRegisteredAsync}></Register> : <></>}
      </div>
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && display === "Desktop" && <AddPersonToGroup contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images} themeChosen={themeChosen}></AddPersonToGroup>}
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && display === "Mobile" && <AddPersonToGroupVertical contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images} themeChosen={themeChosen}></AddPersonToGroupVertical>}
    </div>
  );
}


