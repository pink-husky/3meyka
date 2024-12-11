import React, { useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    query,
    where,
    collection,
    getDocs
} from 'firebase/firestore';
import { auth, googleProvider, firestore } from '../../firebase.ts';
import SnakePage from '../GamePage_3meyka/SnakePage.tsx';

interface UserProfile {
    email: string;
    username: string;
}

const UserInterface: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [authMode, setAuthMode] = useState<'register' | 'login' | 'update-username'>('register');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isPlayingSnake, setIsPlayingSnake] = useState(false);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserProfile(currentUser.uid);
            } else {
                setUser(null);
                setUserProfile(null);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const fetchUserProfile = async (uid: string) => {
        try {
            const userDocRef = doc(firestore, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
            }
        } catch (error: any) {
            console.error('Error fetching user profile:', error);
            setError(error.message);
        }
    };

    const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '==', username.trim().toLowerCase()));
            const querySnapshot = await getDocs(q);

            console.log('Username check result:', {
                username,
                isEmpty: querySnapshot.empty,
                docs: querySnapshot.docs.map(doc => doc.data())
            });

            return querySnapshot.empty;
        } catch (error) {
            console.error('Error checking username uniqueness:', error);
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Trim and lowercase the username to prevent duplicates
            const normalizedUsername = formData.username.trim().toLowerCase();

            if (authMode === 'register') {
                // Validate username format
                if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
                    setError('Username must be between 3 and 20 characters');
                    return;
                }

                // Check username uniqueness before registration
                const isUsernameUnique = await checkUsernameUniqueness(normalizedUsername);
                if (!isUsernameUnique) {
                    setError('Username is already taken');
                    return;
                }

                // Create user with email and password
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                // Create user profile in Firestore
                await setDoc(doc(firestore, 'users', userCredential.user.uid), {
                    email: formData.email,
                    username: normalizedUsername
                });
            } else {
                await signInWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );
            }
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        try {
            // Check username uniqueness
            const isUsernameUnique = await checkUsernameUniqueness(formData.username);
            if (!isUsernameUnique) {
                setError('Username is already taken');
                return;
            }

            // Update username in Firestore
            await setDoc(doc(firestore, 'users', user.uid), {
                ...(userProfile || {}),
                username: formData.username
            });

            // Refresh user profile
            await fetchUserProfile(user.uid);

            // Reset mode
            setAuthMode('register');
            setError(null);
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);

            // Check if user already exists in Firestore
            const userDocRef = doc(firestore, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Prompt for username if not exists
                setAuthMode('register');
            }
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        }
    };

    const userButtons = [
        {
            label: 'Update Username',
            action: () => setAuthMode('update-username')
        },
        {
            label: 'Play Snake',
            action: () => setIsPlayingSnake(true)
        },
        {
            label: 'Logout',
            action: handleLogout
        }
    ];
    // If playing snake, render snake game
    if (isPlayingSnake) {
        return (
            <SnakePage
                onExit={() => setIsPlayingSnake(false)}
            />
        );
    }

    const toggleAuthMode = () => {
        setAuthMode(prev => prev === 'register' ? 'login' : 'register');
        setError(null);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10">
            <div
                className="bg-black bg-opacity-50 text-green-500
        rounded-lg p-8 w-96 backdrop-blur-sm border border-green-800"
            >
                {!user ? (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <h2 className="text-2xl text-center mb-4">
                            {authMode === 'register' ? 'Sign up' : 'Log in'}
                        </h2>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-black bg-opacity-50 border border-green-700
                text-green-300 p-2 rounded focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>

                        {authMode === 'register' && (
                            <div>
                                <label className="block mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full bg-black bg-opacity-50 border border-green-700
                text-green-300 p-2 rounded focus:outline-none focus:border-green-500"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full bg-black bg-opacity-50 border border-green-700
                text-green-300 p-2 rounded focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-800 text-white p-2 rounded
              hover:bg-green-700 transition duration-300"
                        >
                            {authMode === 'register' ? 'Sign up' : 'Log in'}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full bg-green-800 text-white p-2 rounded
              hover:bg-green-700 transition duration-300"
                        >
                            {authMode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
                        </button>

                        <div className="text-center mt-2">
                            <a
                                href="#"
                                className="text-xs text-green-400 hover:text-green-300
                transition duration-300 underline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleAuthMode();
                                }}
                            >
                                {authMode === 'register'
                                    ? 'Already have an account? Log in'
                                    : 'Don\'t have an account? Register'}
                            </a>
                        </div>
                    </form>
                ) : authMode === 'update-username' ? (
                    <form onSubmit={handleUpdateUsername} className="space-y-4">
                        <h2 className="text-2xl text-center mb-4">
                            Update Username
                        </h2>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block mb-2">New Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full bg-black bg-opacity-50 border border-green-700
                text-green-300 p-2 rounded focus:outline-none focus:border-green-500"
                                required
                                minLength={3}
                                maxLength={20}
                                placeholder={userProfile?.username}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-800 text-white p-2 rounded
              hover:bg-green-700 transition duration-300"
                        >
                            Update Username
                        </button>

                        <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className="w-full bg-gray-700 text-white p-2 rounded
              hover:bg-gray-600 transition duration-300"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-2xl text-center mb-4">
                            Welcome, {userProfile?.username || user?.email}
                        </h2>
                        {userButtons.map((btn, index) => (
                            <button
                                key={index}
                                onClick={btn.action}
                                className="w-full bg-green-800 text-white p-2 rounded
                hover:bg-green-700 transition duration-300"
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInterface;