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
import NotificationsView from "./NotificationsSettings";
import AppearanceSettings from "./AppearanceSettings";
import useWebSocket from "./webSocket";
import Theme from "./Theme";
import Fonts from "./Fonts";


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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [incomingSoundsEnabled, setIncomingSoundsEnabled] = useState(false);
  const [outgoingMessagesSoundsEnabled, setOutgoingMessagesSoundsEnabled] = useState(false);

  const [themePressed, setThemePressed] = useState(false)
  const [fontPressed, setFontPressed] = useState(false)

  const [themeChosen, setThemeChosen] = useState("Dark")
  const [fontChosen, setFontChosen] = useState("Arial")
    
  const [ messages, setMessages] = useState([]); // Store received messages
  // Only initialize WebSocket when user is valid (not -1 and not null)
  const { isConnected, sendMessage } = useWebSocket(
    user !== -1 && user !== null ? `ws://localhost:8080?userId=${user}` : null, 
    setMessages,
    incomingSoundsEnabled,
    outgoingMessagesSoundsEnabled
  );

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
      const response = await fetch('http://localhost:3002/users'); // Replace with your API endpoint
      const result = await response.json();
      updateUsers(result);
      console.log(result);
    };

  const fetchData2 = async () => {
      const response = await fetch(`http://localhost:3002/contacts?user=${user}`); // Replace with your API endpoint
      const result = await response.json();
      updateContacts(result);
      // console.log("contacts = " + JSON.stringify(result));
    };

  const fetchImages = async () => {
      const response = await fetch(`http://localhost:3002/images`); // Replace with your API endpoint
      const result = await response.json();
      updateImages(result);
      console.log(result);
    };

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
        }

    } catch (err) {
        console.error(JSON.stringify(err))
    }
  }

  return (
    <div className="absolute left-0 top-0 w-full h-full">
      <div className={`relative left-0 top-0 w-full h-full flex flex-row bg-[#101D42] ${(addingToGroup === true) ? 'blur-sm' : 'blur-none'}`}>
        {themePressed ? <Theme curr_user={user} userObj={userObj} themePressed={themePressed} setThemePressed={setThemePressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen}
                        ></Theme> : <></>}
        {fontPressed ? <Fonts curr_user={user} userObj={userObj} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} setThemeChosen={setThemeChosen}
                               fontChosen={fontChosen} setFontChosen={setFontChosen}
                        ></Fonts> : <></>}
        {loggedIn === true && <div className={`relative left-0 top-0 w-full h-full flex flex-row bg-[#101D42] ${(themePressed || fontPressed) ? 'blur-sm' : 'blur-none'}`}>
          {/* {themePressed ? <div className="absolute left-0 top-0 w-full h-full bg-"></div> : <></>} */}
        
          <OptionsBar curr_user={user} users={users} images={images} setPressProfile={setPressProfile} pressedSettings={pressedSettings} setPressedSettings={setPressedSettings}></OptionsBar>
          {pressedProfile ? <ProfileSettings users={users} curr_user={user} images={images} setPressProfile={setPressProfile} fetchData={fetchData} 
                                          fetchData2={fetchData2} fetchImages={fetchImages} addingToGroup={addingToGroup}></ProfileSettings>
                                   :                 
            pressedSettings ? <SettingsView curr_user={user} setPressedSettings={setPressedSettings} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressNotifications={setPressNotifications} setPressAppearance={setPressAppearance}
                                  users={users} images={images} logOutNow={logOutNow} setLoggedIn={setLoggedIn} loggedIn={loggedIn}> </SettingsView>
                                   :
            pressedNotifications ? <NotificationsView userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} setPressedSettings={setPressedSettings} 
                                        setNotificationsEnabled={setNotificationsEnabled} notificationsEnabled={notificationsEnabled} incomingSoundsEnabled={incomingSoundsEnabled} setIncomingSoundsEnabled={setIncomingSoundsEnabled}
                                        outgoingMessagesSoundsEnabled={outgoingMessagesSoundsEnabled} setOutgoingMessagesSoundsEnabled={setOutgoingMessagesSoundsEnabled}
                                        ></NotificationsView>
                                    :
            pressedAppearance ? <AppearanceSettings userObj={userObj} user={user} setPressProfile={setPressProfile} setPressAccount={setPressAccount} setPressAppearance={setPressAppearance} setPressNotifications={setPressNotifications} setPressedSettings={setPressedSettings} 
                                                    themePressed={themePressed} setThemePressed={setThemePressed} fontPressed={fontPressed} setFontPressed={setFontPressed} themeChosen={themeChosen} fontChosen={fontChosen}
                                        ></AppearanceSettings>
                                    :
          <Conversations users={users} contacts={contacts} images={images} setPressed={setPressed} curr_user={user} contact={curr_contact} setCurrContact={setCurrContact}
                                      fetchUsers={fetchData} fetchContacts={fetchData2} fetchImages={fetchImages} setLoggedIn={setLoggedIn} setPotentialContact={setPotentialContact} setAddContact2={setAddContact2}
                                      updateImages={updateImages} updateContacts={updateContacts} updateUsers={updateUsers} setUser={setUser}
          ></Conversations> 
          }
          {profileInfo === false ? <CurrentChat users={users} contacts={contacts} images={images} contact={curr_contact} curr_user={user} setProfileInfo={setProfileInfo} 
                                                addingToGroup={addingToGroup} potentialContact={potentialContact} prevPotentialContact={prevPotentialContact} 
                                                messages={messages} setMessages={setMessages} sendMessage={sendMessage}></CurrentChat>
                                : <ProfileInfo setProfileInfo={setProfileInfo} contact={curr_contact} users={users} curr_user={user} contacts={contacts} images={images} fetchContacts={fetchData2} fetchUsers={fetchData} 
                                      fetchImages={fetchImages} setCurrContact={setCurrContact} setAddToGroup={setAddToGroup} addingToGroup={addingToGroup}></ProfileInfo>}
         
        </div>
        }
        {(registered === true && loggedIn === false) ? <Login users={users} setU={setUser} setRegisteredAsync={setRegisteredAsync}></Login> : (registered === false && loggedIn === false) ? <Register users={users} setRegisteredAsync={setRegisteredAsync}></Register> : <></>}
      </div>
      {profileInfo === true && curr_contact !== null && curr_contact.is_group === true && addingToGroup === true && <AddPersonToGroup contact={curr_contact} curr_user={user} contacts={contacts} users={users} fetchContacts={fetchData2} setAddToGroup={setAddToGroup} images={images}></AddPersonToGroup>}
    </div>
  );
}


