'use client'

import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import {useAuth} from '../../../AuthProvider'
import { X3DHClient } from '../../../x3dh-client';

export default function Register(props) {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const router = useRouter()
    const { loggedIn, registered, setLoggedIn, setRegistered} = useAuth()


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

    // Add this helper function at the top
    function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function register() {
        if(username.length < 8) {
            console.log("Username should be 8 characters or more")
            return
        }
        if(username.length > 128) {
            console.log("Username should be less than 128 characters")
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
        if(password.length > 128) {
            console.log("Password should be less than 128 characters")
            return 
        }
        
        // Generate temporary keys (not saved yet)
        const newIdentityKey = await X3DHClient.generateKeyPair();
        const signedPreKeyPair = await X3DHClient.generateKeyPair();
        const signature = await X3DHClient.sign(newIdentityKey.privateKey, signedPreKeyPair.publicKey);
        
        const newSignedPreKey = {
            keyId: 1,
            publicKey: signedPreKeyPair.publicKey,
            privateKey: signedPreKeyPair.privateKey,
            signature,
        };
        
        const newOneTimePreKeys = await X3DHClient.generateOneTimePreKeys(100, 1);
        
        let msg = {
            username: username,
            email: email,
            password: password,
            identityKeyPublic: newIdentityKey.publicKey, 
            signedPreKeyPublic: newSignedPreKey.publicKey,
            signedPreKeySignature: signature,
            oneTimePreKeysPublic: newOneTimePreKeys.map(k => ({
            keyId: k.keyId,
            publicKey: k.publicKey,
            }))
        };
        
        let requestParams = {
            'method': 'POST',
            'headers': {'Content-Type' : 'application/json'},
            'body': JSON.stringify(msg)
        }
        
        const response = await fetch("http://localhost:3002/register", requestParams);
        
        if(response.status === 201){
            console.log("Got registered suckas")
            // await sleep(2000); // Wait 2 seconds

            // Get user ID from response
            const userData = await response.json();
            const userId = userData.user_id; // Adjust based on your API response
            
            console.log("before getting device Key")
            // await sleep(2000); // Wait 2 seconds

            const deviceKey = await props.getOrCreateDeviceKey(userId);
            
            console.log("before encrypting keys in registration")
            // await sleep(2000); // Wait 2 seconds

            // ✅ Encrypt keys with password using NaCl (synchronous, no await)
            const encryptedKeys = props.encryptKeys(
            {
                identityKey: newIdentityKey,
                signedPreKey: newSignedPreKey,
                oneTimePreKeys: newOneTimePreKeys,
            },
                deviceKey  // ✅ Pass password string directly
            );
            
            console.log("before setting encrypted keys")
            // await sleep(2000); // Wait 2 seconds
            
            // ✅ Save with user ID
            localStorage.setItem(`encrypted_keys_${userId}`, encryptedKeys);
            
            // Set in state
            props.setUser(userId);
            props.setIdentityKey(newIdentityKey);
            props.setSignedPreKey(newSignedPreKey);
            props.setOneTimePreKeys(newOneTimePreKeys);
            // props.setIsKeysLoaded(true);
            
            console.log(`keys are loaded after registration for user: ${userId}`)
            // await sleep(2000); // Wait 2 seconds            

            return "success"
        } else {
            console.log("registration failed bitchass")
            return "error"
        }
    }



    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" onKeyDown={async (e) => {
            if(e.key === 'Enter') {
                const resp = await register();
                if(resp !== null) console.log("should now be in main view"); router.push("/"); console.log("loggedIn = " + loggedIn + " registered = " + registered)
            }}}>
            <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-lg shadow-2xl border border-gray-700/50">
                <div className="flex flex-col mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#3B7E9B] to-[#5BA3C5] bg-clip-text text-transparent">Create Account</h1>
                    <p className="text-gray-400 mt-2 text-sm">Register to SocialiseIt</p>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300 pl-1">Username</label>
                        <input
                            type="text"
                            required={true}
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if(usernameExistsF()) setUsernameExists(true)
                            }}
                            className="px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 text-white placeholder-gray-400 outline-none focus:border-[#3B7E9B] focus:ring-2 focus:ring-[#3B7E9B]/20 transition-all"
                        />
                        {usernameExists && <p className="text-red-400 text-xs pl-1 -mt-1">Username already exists</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300 pl-1">Email</label>
                        <input
                            type="email"
                            required={true}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if(emailExistsF()) setEmailExists(true)
                            }}
                            className="px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 text-white placeholder-gray-400 outline-none focus:border-[#3B7E9B] focus:ring-2 focus:ring-[#3B7E9B]/20 transition-all"
                        />
                        {emailExists && <p className="text-red-400 text-xs pl-1 -mt-1">Email already exists</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-300 pl-1">Password</label>
                        <input
                            type="password"
                            required={true}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            className="px-4 py-3 bg-gray-700/50 rounded-lg border border-gray-600 text-white placeholder-gray-400 outline-none focus:border-[#3B7E9B] focus:ring-2 focus:ring-[#3B7E9B]/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={async () => {
                            const resp = await register();
                            if(resp === "success") {
                                await props.setRegisteredAsync();
                            }
                        }}
                        className="w-full py-3 mt-2 bg-gradient-to-r from-[#3B7E9B] to-[#5BA3C5] hover:from-[#5BA3C5] hover:to-[#3B7E9B] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#3B7E9B]/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Create Account
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <span
                            className='text-[#3B7E9B] hover:text-[#5BA3C5] cursor-pointer font-medium transition-colors'
                            onClick={async () => {await props.setRegisteredAsync()}}
                        >
                            Login here
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}