import React, { useState } from 'react';

const UserInterface: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically implement actual authentication logic
        console.log(
            authMode === 'register'
                ? 'Registration attempted:'
                : 'Login attempted:',
            formData
        );
        // For demo, we'll just log in
        setIsLoggedIn(true);
    };

    const userButtons = [
        { label: 'Profile', action: () => console.log('Profile clicked') },
        { label: 'Settings', action: () => console.log('Settings clicked') },
        { label: 'Logout', action: () => setIsLoggedIn(false) }
    ];

    const toggleAuthMode = () => {
        setAuthMode(prev => prev === 'register' ? 'login' : 'register');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10">
            <div
                className="bg-black bg-opacity-50 text-green-500
        rounded-lg p-8 w-96 backdrop-blur-sm border border-green-800"
            >
                {!isLoggedIn ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-2xl text-center mb-4">
                            {authMode === 'register' ? 'Sign up' : 'Log in'}
                        </h2>

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
                                />
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
                            {authMode === 'register' ? 'Register' : 'Log In'}
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
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-2xl text-center mb-4">Welcome, User</h2>
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