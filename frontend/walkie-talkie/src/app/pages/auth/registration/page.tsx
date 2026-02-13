'use client'

import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import {useAuth} from '../../../AuthProvider'
import { X3DHClient } from '../../../x3dh-client';

declare global {
    interface Window {
        google: any;
    }
}

export default function Register(props) {

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const router = useRouter()
    const { loggedIn, registered, setLoggedIn, setRegistered} = useAuth()
    const googleButtonRef = useRef<HTMLDivElement>(null)

    // Load Google Identity Services script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: 'filled_black',
                        size: 'large',
                        width: '100%',
                        text: 'signup_with',
                        shape: 'rectangular',
                    }
                );
            }
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    async function handleGoogleResponse(response: any) {
        console.log("Google sign-up response received");

        try {
            const res = await fetch("http://localhost:3002/auth/google", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Google auth failed:", data.error);
                return;
            }

            console.log("Google auth success, userId:", data.userId, "isNewUser:", data.isNewUser);
            props.setUser(data.userId);

            if (data.isNewUser) {
                // Generate X3DH keys for the new Google user
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

                // Register keys on the server
                await fetch("http://localhost:3002/register-keys", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: data.userId,
                        identityKeyPublic: newIdentityKey.publicKey,
                        signedPreKeyPublic: newSignedPreKey.publicKey,
                        signedPreKeySignature: signature,
                        oneTimePreKeysPublic: newOneTimePreKeys.map(k => ({
                            keyId: k.keyId,
                            publicKey: k.publicKey,
                        })),
                    }),
                });

                // Encrypt and store keys locally
                const deviceKey = await props.getOrCreateDeviceKey(data.userId);
                const encryptedKeys = props.encryptKeys(
                    {
                        identityKey: newIdentityKey,
                        signedPreKey: newSignedPreKey,
                        oneTimePreKeys: newOneTimePreKeys,
                    },
                    deviceKey
                );
                localStorage.setItem(`encrypted_keys_${data.userId}`, encryptedKeys);

                // Set keys in state
                props.setIdentityKey(newIdentityKey);
                props.setSignedPreKey(newSignedPreKey);
                props.setOneTimePreKeys(newOneTimePreKeys);

                console.log("Keys generated and registered for new Google user");
            } else {
                // Existing user — load their keys
                console.log("User already exists, loading keys via Google login");
                const deviceKey = await props.getOrCreateDeviceKey(data.userId);
                const loaded = await props.loadKeysAfterLogin(data.userId, deviceKey);
                if (loaded) {
                    console.log("Keys loaded after Google login (existing user)");
                } else {
                    console.error("Failed to load keys after Google login");
                }
            }

            // Toggle registered so we go to logged-in state
            await props.setRegisteredAsync();
            setLoggedIn();
            router.push("/");
        } catch (error) {
            console.error("Google sign-up error:", error);
        }
    }

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
            
            // Save credentials for pre-fill on next login
            localStorage.setItem(`remembered_credentials_${userId}`, JSON.stringify({ username, password }));
            localStorage.setItem('last_remembered_user_id', userId);
            const accounts = JSON.parse(localStorage.getItem('remembered_accounts') || '{}');
            accounts[username] = userId;
            localStorage.setItem('remembered_accounts', JSON.stringify(accounts));
            localStorage.setItem('has_account', 'true');

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

                    <div className="relative flex items-center my-2">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="mx-4 text-gray-400 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    <div ref={googleButtonRef} className="flex justify-center w-full"></div>
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