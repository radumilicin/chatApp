'use client'

import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../AuthProvider'

export default function Login(props: any) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState(false)
    const router = useRouter()
    const [users, setUsers] = useState([])
    const { loggedIn, registered, setLoggedIn, setRegistered} = useAuth()

     useEffect(() => {
        const fetchUsers = async () => {
        const res = await fetch('http://localhost:3002/users'); // Replace with your API endpoint
        const data = await res.json();
        setUsers(data);
        };
        fetchUsers();
        console.log("props = " + JSON.stringify(props));
    }, []);

    const setLoggedInAsync = async () => {
        setLoggedIn()
    }

    function getUsernames() {
        if(users !== null) return users.map((elem) => elem.username)
        else return []
    }
    
    function usernameExistsF() {
        return getUsernames().includes(username)
    }

    async function login() {
        if(username.length < 8) {
            console.log("Username should be 8 characters or more")
            return
        }
        
        if(password.length < 8) {
            console.log("Password should be 8 or more characters long")
            return 
        }

        let msg = {
            username: username,
            password: password
        }

        const response = await fetch("http://localhost:3002/login", {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(msg),
            credentials: 'include', // allows cookies to be set
        });

        const user = await response.json()

        props.setU(user.userId)


        if(response.status === 200){
            console.log("Logged in")
            setLoggedInAsync();
            // localStorage.setItem("jwt-token", user.) 
            return user
        } else {
            console.log("login failed")
            return {}
        }
    }

    return (
        <div className="absolute left-[35%] top-[30%] w-[30%] h-[40%] ">
            <div className="relative left-0 top-0 h-full w-full flex flex-col gap-2 rounded-xl bg-gray-800">
                <div className="flex flex-col h-[20%] justify-center items-center text-2xl font-sans font-semibold text-[#3B7E9B]">Login to SocialiseIt</div>
                <div className="flex flex-row w-full h-[25%]">
                    <div className="relative flex flex-col h-[80%] w-[80%] left-[10%]">
                        <div className="flex h-[30%] w-[20%] text-2xl font-sans text-gray-400 justify-start indent-3">Username</div>
                        <input type="text" required={true} placeholder="Enter your username" value={username} 
                               onChange={(e) => { setUsername(e.target.value); 
                                                  if(usernameExistsF()) setUsernameExists(true)  }}
                               className="flex indent-[10px] w-full h-[50%] flex-row justify-center items-center outline-none bg-gray-600 rounded-xl border-2 border-gray-400 focus:bg-gray-600"></input>
                    </div>
                </div>
                <div className="flex flex-row w-full h-[25%]">
                    <div className="relative flex flex-col h-[80%] w-[80%] left-[10%]">
                        <div className="flex h-[30%] w-[20%] text-2xl font-sans text-gray-400 justify-start indent-3">Password</div>
                        <input type="password" required={true} placeholder="Enter your password" value={password} 
                               onChange={(e) => {setPassword(e.target.value)}}
                                className="flex indent-[10px] w-full h-[50%] flex-row justify-center items-center outline-none bg-gray-600 rounded-xl border-2 border-gray-400"></input>
                    </div>
                </div>
                <div className="flex flex-row w-full h-[12%] justify-center items-start">
                    <div className="w-[40%] h-[50%] bg-gray-600 rounded-xl flex flex-row justify-center items-center text-xl font-semibold font-sans hover:cursor-pointer"
                         onClick={async () => { const resp = await login(); 
                                                if(resp !== null) { console.log("should now be in main view"); router.push("/"); console.log("loggedIn = " + loggedIn + " registered = " + registered) }
                         }}>
                            Submit
                    </div>
                </div>
                <div className="flex flex-row left-0 w-full h-[8%] justify-center">
                    <div className="flex flex-row w-[80%] h-[30%] text-lg justify-center items-center">
                        <div className='flex justify-center hover:border-b-2 hover:border-blue-600 hover:cursor-pointer' onClick={async () => {if(registered) {await props.setRegisteredAsync();}}}>Register if you don't have an account!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}