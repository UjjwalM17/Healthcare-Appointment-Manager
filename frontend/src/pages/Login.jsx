import { useState } from 'react'
import API from '../services/api'

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e?.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await API.post('/api/auth/login', { email, password })
            localStorage.setItem('token', res.data.token)
            onLogin(res.data.token)
        } catch (e) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white px-8 py-10 shadow-lg rounded-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
                    <p className="text-sm text-gray-500 mt-2">Please enter your details to sign in.</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
                        {error}
                    </div>
                )}
                
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="Enter your email"
                            type="email"
                            required
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 flex justify-center text-sm font-semibold rounded-xl text-white transition-all shadow-md ${
                            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                        }`}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}