import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';

export default function Register(props) {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState(false)
    const [emailExists, setEmailExists] = useState(false)


    function getUsernames() {
        if(props.users !== null) return props.users.map((elem) => elem.username)
        else return []
    }
    
    function getEmails() {
        if(props.users !== null) return props.users.map((elem) => elem.email)
        else return []
    }

    function usernameExistsF() {
        return getUsernames().includes(username)
    }
    
    function emailExistsF() {
        return getEmails().includes(email)
    }

    async function register() {
        if(username.length < 8) {
            console.log("Username should be 8 characters or more")
            return
        }
        
        if(!email.includes('@')){
            console.log("Email addresses should include `@`")
            return
        } 
        
        if(password.length < 8) {
            console.log("Password should be 8 or more characters long")
            return 
        }

        let msg = {
            username: username,
            email: email,
            password: password
        }

        let requestParams = {
            'method': 'POST',
            'headers': {'Content-Type' : 'application/json'},
            'body': JSON.stringify(msg)
        }

        const response = await fetch("http://localhost:3002/register", requestParams);
        if(response.status === 200){
            console.log("Got registered suckas")
        } else {
            console.log("registration failed bitchass")
        }
    }

    return (
        <div className="absolute left-[35%] top-[25%] w-[30%] h-[50%] ">
            <div className="relative left-0 top-0 h-full w-full flex flex-col gap-2 rounded-xl bg-gray-800">
                <div className="flex flex-col h-[20%] justify-center items-center text-2xl font-sans font-semibold text-[#3B7E9B]">Register to SocialiseIt</div>
                <div className="flex flex-row w-full h-[20%]">
                    <div className="relative flex flex-col h-[80%] w-[80%] left-[10%]">
                        <div className="flex h-[30%] w-[20%] text-2xl font-sans text-gray-400 justify-start indent-3">Username</div>
                        <input type="text" required={true} placeholder="Enter your username" value={username} 
                               onChange={(e) => { setUsername(e.target.value); 
                                                  if(usernameExistsF()) setUsernameExists(true)  }}
                               className="flex indent-[10px] w-full h-[50%] flex-row justify-center items-center outline-none bg-gray-600 rounded-xl border-2 border-gray-400 focus:bg-gray-600"></input>
                        {usernameExists && <div className="flex flex-row items-center justify-center text-red-500 h-[30%] w-[50%]">Username already exists</div>}
                    </div>
                </div>
                <div className="flex flex-row w-full h-[20%]">
                    <div className="relative flex flex-col h-[80%] w-[80%] left-[10%]">
                        <div className="flex h-[30%] w-[20%] text-2xl font-sans text-gray-400 justify-start indent-3">Email</div>
                        <input type="email" required={true} placeholder="Enter your email" value={email} 
                               onChange={(e) => {setEmail(e.target.value)
                                                 if(emailExistsF()) setEmailExists(true)  }}
                                className="flex indent-[10px] w-full h-[50%] flex-row justify-center items-center outline-none bg-gray-600 rounded-xl border-2 border-gray-400"></input>
                        {emailExists && <div className="flex flex-row items-center justify-center text-red-500 h-[30%] w-[50%]">Email already exists</div>}
                    </div>
                </div>
                <div className="flex flex-row w-full h-[20%]">
                    <div className="relative flex flex-col h-[80%] w-[80%] left-[10%]">
                        <div className="flex h-[30%] w-[20%] text-2xl font-sans text-gray-400 justify-start indent-3">Password</div>
                        <input type="password" required={true} placeholder="Enter your password" value={password} 
                               onChange={(e) => {setPassword(e.target.value)}}
                                className="flex indent-[10px] w-full h-[50%] flex-row justify-center items-center outline-none bg-gray-600 rounded-xl border-2 border-gray-400"></input>
                    </div>
                </div>
                <div className="flex flex-row w-full h-[12%] justify-center items-start">
                    <div className="w-[40%] h-[50%] bg-gray-600 rounded-xl flex flex-row justify-center items-center text-xl font-semibold font-sans hover:cursor-pointer"
                         onClick={async () => { await register(); }}>
                            Submit
                    </div>
                </div>
                <div className="flex flex-row left-0 w-full h-[8%] justify-center">
                    <div className="flex flex-row w-[80%] h-[30%] text-lg justify-center items-center">
                        <Link href="/auth/Login" className='flex justify-center hover:border-b-2 hover:border-blue-600'>If you have an account log in!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}