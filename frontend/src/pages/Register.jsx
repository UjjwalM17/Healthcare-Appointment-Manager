import { useState, useRef } from 'react'
import API from '../services/api'

export default function Register() {
    const [form, setForm] = useState({ name:'', email:'', password:'', role:'PATIENT' })
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const isSubmitting = useRef(false)

    const handleRegister = async (e) => {
        e?.preventDefault()
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true)
        setMessage('')
        try {
            await API.post('/api/auth/register', form)
            setMessage('Account created successfully! You can now login.')
            setIsSuccess(true)
            setForm({ name:'', email:'', password:'', role:'PATIENT' })
        } catch (e) {
            setMessage('Registration failed. Email may already exist.')
            setIsSuccess(false)
        } finally {
            isSubmitting.current = false;
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white px-8 py-10 shadow-lg rounded-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
                    <p className="text-sm text-gray-500 mt-2">Join our healthcare platform today.</p>
                </div>
                
                {message && (
                    <div className={`p-3 rounded-lg text-sm mb-6 border text-center ${
                        isSuccess ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {message}
                    </div>
                )}
                
                <form className="space-y-5" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="John Doe"
                            required
                            value={form.name} 
                            onChange={e => setForm({...form, name:e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="john@example.com"
                            type="email"
                            required
                            value={form.email} 
                            onChange={e => setForm({...form, email:e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="••••••••"
                            type="password"
                            required
                            value={form.password} 
                            onChange={e => setForm({...form, password:e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                        <select 
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                            value={form.role}
                            onChange={e => setForm({...form, role:e.target.value})}
                        >
                            <option value="PATIENT">Patient</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 flex justify-center text-sm font-semibold rounded-xl text-white transition-all shadow-md mt-6 ${
                            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                        }`}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    )
}