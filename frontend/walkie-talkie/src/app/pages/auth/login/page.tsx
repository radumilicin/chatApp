'use client'

import react, {useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../AuthProvider'
import crypto, { sign } from 'crypto';
import { X3DHClient } from '../../../x3dh-client';
import { API_URL } from '../../../config'

declare global {
    interface Window {
        google: any;
    }
}

export default function Login(props: any) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [usernameExists, setUsernameExists] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()
    const [users, setUsers] = useState([])
    const { loggedIn, registered, setLoggedIn, setRegistered} = useAuth()
    const googleButtonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const lastUserId = localStorage.getItem('last_remembered_user_id');
        if (lastUserId) {
            const saved = localStorage.getItem(`remembered_credentials_${lastUserId}`);
            if (saved) {
                try {
                    const { username: savedUser, password: savedPass } = JSON.parse(saved);
                    setUsername(savedUser || '');
                    setPassword(savedPass || '');
                    setRememberMe(true);
                } catch {}
            }
        }
    }, []);

    function lookupPasswordForUsername(typedUsername: string) {
        try {
            const accounts = JSON.parse(localStorage.getItem('remembered_accounts') || '{}');
            const userId = accounts[typedUsername];
            if (userId) {
                const saved = localStorage.getItem(`remembered_credentials_${userId}`);
                if (saved) {
                    const { password: savedPass } = JSON.parse(saved);
                    setPassword(savedPass || '');
                    setRememberMe(true);
                    return;
                }
            }
        } catch {}
        if (!rememberMe) setPassword('');
    }

     useEffect(() => {
        const fetchUsers = async () => {
        const res = await fetch(`${API_URL}/users`); // Replace with your API endpoint
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
            const res = await fetch(`${API_URL}/auth/google`, {
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
                await fetch(`${API_URL}/register-keys`, {
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
        setErrorMessage('')

        if(username.length < 8) {
            setErrorMessage("Username should be 8 characters or more")
            return null
        }

        if(password.length < 8) {
            setErrorMessage("Password should be 8 or more characters long")
            return null
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            const user = await response.json()

            if(response.status !== 200) {
                setErrorMessage(user.error || "Login failed")
                return null
            }

            console.log(`User: ${user.userId}`)
            props.setU(user.userId)

            if (rememberMe) {
                localStorage.setItem(`remembered_credentials_${user.userId}`, JSON.stringify({ username, password }));
                localStorage.setItem('last_remembered_user_id', user.userId);
                const accounts = JSON.parse(localStorage.getItem('remembered_accounts') || '{}');
                accounts[username] = user.userId;
                localStorage.setItem('remembered_accounts', JSON.stringify(accounts));
            } else {
                localStorage.removeItem(`remembered_credentials_${user.userId}`);
                localStorage.removeItem('last_remembered_user_id');
                const accounts = JSON.parse(localStorage.getItem('remembered_accounts') || '{}');
                delete accounts[username];
                localStorage.setItem('remembered_accounts', JSON.stringify(accounts));
            }

            setLoggedInAsync();

            const deviceKey = await props.getOrCreateDeviceKey(user.userId);
            console.log("Before loading keys after login")

            const loaded = await props.loadKeysAfterLogin(user.userId, deviceKey)
            if(!loaded) {
                console.error("Encrypted keys failed to load")
            }

            return user
        } catch (error) {
            console.error("Login error:", error)
            setErrorMessage("Could not connect to server")
            return null
        }
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" onKeyDown={async (e) => {
            if(e.key === 'Enter') {
                const resp = await login();
                if(resp !== null) {
                    router.push("/");
                }
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
                                lookupPasswordForUsername(e.target.value);
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
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700/50 text-[#3B7E9B] focus:ring-[#3B7E9B]/20 cursor-pointer"
                        />
                        <span className="text-sm text-gray-300">Remember me</span>
                    </label>
                    {errorMessage && <p className="text-red-400 text-sm text-center -mb-2">{errorMessage}</p>}
                    <button
                        onClick={async () => {
                            const resp = await login();
                            if(resp !== null) {
                                router.push("/");
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
