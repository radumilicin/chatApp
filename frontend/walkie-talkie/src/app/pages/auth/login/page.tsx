'use client'

import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../AuthProvider'
import crypto, { sign } from 'crypto';
import { X3DHClient } from '../../../x3dh-client';

declare global {
    interface Window {
        google: any;
    }
}

export default function Login(props: any) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState(false)
    const router = useRouter()
    const [users, setUsers] = useState([])
    const { loggedIn, registered, setLoggedIn, setRegistered} = useAuth()
    const googleButtonRef = useRef<HTMLDivElement>(null)

     useEffect(() => {
        const fetchUsers = async () => {
        const res = await fetch('http://localhost:3002/users'); // Replace with your API endpoint
        const data = await res.json();
        setUsers(data);
        };
        fetchUsers();
        // console.log("props = " + JSON.stringify(props));
    }, []);

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
                        text: 'signin_with',
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

    // Add this helper function at the top
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function handleGoogleResponse(response: any) {
        console.log("Google sign-in response received");

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
            props.setU(data.userId);

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
                // Existing user — load keys
                const deviceKey = await props.getOrCreateDeviceKey(data.userId);
                const loaded = await props.loadKeysAfterLogin(data.userId, deviceKey);
                if (loaded) {
                    console.log("Keys loaded after Google login");
                } else {
                    console.error("Failed to load keys after Google login");
                }
            }

            setLoggedInAsync();
            router.push("/");
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    }

    async function login() {
        console.log("In login")

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

        console.log(`User: ${user.userId}`)
        sleep(2000)

        if(response.status === 200){
            console.log("Logged in")
            setLoggedInAsync();

            const deviceKey = await props.getOrCreateDeviceKey(user.userId);
            // const deviceKeyString = await props.cryptoKeyToBase64(deviceKey)

            console.log("Before loading keys after login")

            const loaded = await props.loadKeysAfterLogin(user.userId, deviceKey)
            if(loaded) {
                console.log("Encrypted keys loaded")
            } else {
                console.log("Encrypted keys failed to load")
            }

            // Fetch what's in the database
            const dbResponse = await fetch(`http://localhost:3002/api/keys?recipient_id=${user.userId}`);
            const dbKeys = await dbResponse.json();

            console.log("COMPARISON:");
            console.log(`Bob localStorage signedPreKey user ${user.userId}:`, props.signedPreKey.publicKey);
            console.log(`Bob database signedPreKey user ${user.userId} :`, dbKeys.signedPreKey.public_key);
            console.log("DO THEY MATCH?", props.signedPreKey.publicKey === dbKeys.signedPreKey.public_key);

            // localStorage.setItem("jwt-token", user.)
            return user
        } else {
            console.log("login failed")
            return {}
        }
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" onKeyDown={async (e) => {
            if(e.key === 'Enter') {
                const resp = await login();
                if(resp !== null) console.log("should now be in main view"); router.push("/"); console.log("loggedIn = " + loggedIn + " registered = " + registered)
            }}}>
            <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-lg shadow-2xl border border-gray-700/50">
                <div className="flex flex-col mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#3B7E9B] to-[#5BA3C5] bg-clip-text text-transparent">Welcome Back</h1>
                    <p className="text-gray-400 mt-2 text-sm">Login to SocialiseIt</p>
                </div>
                <div className="flex flex-col gap-6">
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
                            const resp = await login();
                            if(resp !== null) {
                                console.log("should now be in main view");
                                router.push("/");
                                console.log("loggedIn = " + loggedIn + " registered = " + registered)
                            }
                        }}
                        className="w-full py-3 mt-2 bg-gradient-to-r from-[#3B7E9B] to-[#5BA3C5] hover:from-[#5BA3C5] hover:to-[#3B7E9B] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#3B7E9B]/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Sign In
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
                        Don't have an account?{' '}
                        <span
                            className='text-[#3B7E9B] hover:text-[#5BA3C5] cursor-pointer font-medium transition-colors'
                            onClick={async () => {if(registered) {await props.setRegisteredAsync();}}}
                        >
                            Register here
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
