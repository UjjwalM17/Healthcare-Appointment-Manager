import { useState, useEffect, useRef } from 'react'
import API from '../services/api'

export default function PatientDashboard({ userId, activeTab }) {
    const [specialization, setSpecialization] = useState('')
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [date, setDate] = useState('')
    const [slots, setSlots] = useState([])
    const [selectedSlot, setSelectedSlot] = useState('')
    const [symptoms, setSymptoms] = useState('')
    const [appointments, setAppointments] = useState([])
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchMyAppointments()
    }, [])

    const fetchMyAppointments = async () => {
        try {
            const res = await API.get(`/api/appointments/patient/${userId}`)
            setAppointments(res.data)
        } catch (e) { console.error(e) }
    }

    const searchDoctors = async () => {
        try {
            const res = await API.get(`/api/doctors?specialization=${specialization}`)
            setDoctors(res.data)
        } catch (e) { setMessage('Search failed') }
    }

    const fetchSlots = async (doctorId) => {
        if (!date) return setMessage('Please select a date first')
        try {
            const res = await API.get(`/api/doctors/${doctorId}/slots?date=${date}`)
            setSlots(res.data)
        } catch (e) { setMessage('Could not fetch slots') }
    }

    const isBooking = useRef(false)

    const bookAppointment = async () => {
        if (isBooking.current) return;
        isBooking.current = true;
        try {
            await API.post('/api/appointments/book', {
                patient: { id: userId },
                doctor: { id: selectedDoctor.id },
                appointmentDate: date,
                appointmentTime: selectedSlot,
                symptoms
            })
            setMessage('Appointment booked successfully!')
            fetchMyAppointments()
            // Reset form
            setSelectedDoctor(null)
            setDate('')
            setSlots([])
            setSelectedSlot('')
            setSymptoms('')
        } catch (e) {
            setMessage(e.response?.data || 'Booking failed')
        } finally {
            isBooking.current = false;
            setTimeout(() => setMessage(''), 5000);
        }
    }

    const cancelAppointment = async (id) => {
        try {
            await API.put(`/api/appointments/${id}/cancel`)
            setMessage('Appointment cancelled')
            fetchMyAppointments()
            setTimeout(() => setMessage(''), 5000);
        } catch (e) { setMessage('Cancel failed') }
    }

    const upcomingAppointments = appointments.filter(a => a.status === 'CONFIRMED');
    const pastAppointments = appointments.filter(a => a.status !== 'CONFIRMED');

    return (
        <div className="space-y-6">
            
            {/* Top Stat Cards - Visible on all tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Upcoming Visits</p>
                        <h4 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                        <h4 className="text-2xl font-bold text-gray-900">{appointments.length}</h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">AI Summaries</p>
                        <h4 className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.postVisitSummary).length}</h4>
                    </div>
                </div>
            </div>
            
            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Panel */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-green-100 text-green-600 p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
                                Find a Doctor
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        placeholder="Specialization (e.g. Cardiology)"
                                        value={specialization} 
                                        onChange={e => setSpecialization(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && searchDoctors()}
                                    />
                                    <button 
                                        className="absolute right-2 top-2 p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        onClick={searchDoctors}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </button>
                                </div>

                                {doctors.length > 0 && (
                                    <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-1">
                                        {doctors.map(doc => (
                                            <div 
                                                key={doc.id} 
                                                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                                    selectedDoctor?.id === doc.id 
                                                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                                }`}
                                                onClick={() => {
                                                    setSelectedDoctor(doc)
                                                    setSlots([])
                                                    setSelectedSlot('')
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                        {doc.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Dr. {doc.user.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.specialization}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedDoctor && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></span>
                                    Book Slot
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5">Select Date</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="date" 
                                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                                value={date}
                                                onChange={e => {
                                                    setDate(e.target.value)
                                                    setSlots([])
                                                    setSelectedSlot('')
                                                }} 
                                            />
                                            <button 
                                                className="px-4 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors"
                                                onClick={() => fetchSlots(selectedDoctor.id)}
                                            >
                                                Check
                                            </button>
                                        </div>
                                    </div>

                                    {slots.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5">Available Times</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {slots.map(slot => (
                                                    <div 
                                                        key={slot} 
                                                        className={`py-2 text-center text-sm rounded-lg cursor-pointer font-medium transition-all ${
                                                            selectedSlot === slot 
                                                            ? 'bg-green-600 text-white shadow-md transform scale-[1.02]' 
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                                                        }`}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedSlot && (
                                        <div className="space-y-3 pt-4 border-t border-gray-100 mt-2">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1.5">Symptoms (Optional)</label>
                                                <textarea 
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none h-24 text-sm"
                                                    placeholder="Briefly describe what you're experiencing for the AI summary..."
                                                    value={symptoms} 
                                                    onChange={e => setSymptoms(e.target.value)} 
                                                />
                                            </div>
                                            <button 
                                                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                                onClick={bookAppointment}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Confirm Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Placeholder for larger screens to balance layout */}
                    <div className="hidden lg:block bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-8">
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-green-900 mb-2">Search & Book</h3>
                            <p className="text-green-800">Use the panel on the left to find a specialist and book your next appointment seamlessly.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table - Shown on 'appointments' tab */}
            {activeTab === 'appointments' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Appointment History</h3>
                        </div>
                        
                        {appointments.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <p className="text-gray-500 font-medium">No appointments found</p>
                                <p className="text-sm text-gray-400 mt-1">Book your first visit from the dashboard.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {appointments.map((apt) => (
                                            <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                            {apt.doctor?.user?.name?.charAt(0)}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-bold text-gray-900">Dr. {apt.doctor?.user?.name}</div>
                                                            <div className="text-xs text-gray-500">{apt.doctor?.specialization || 'General'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{apt.appointmentDate}</div>
                                                    <div className="text-xs text-gray-500">{apt.appointmentTime}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {apt.status === 'CONFIRMED' && (
                                                        <button 
                                                            onClick={() => cancelAppointment(apt.id)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* AI Summaries Section */}
                    {appointments.some(a => a.preVisitSummary || a.postVisitSummary) && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></span>
                                    AI Care Summaries
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {appointments.filter(a => a.preVisitSummary || a.postVisitSummary).map(apt => (
                                    <div key={'summary-'+apt.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                                            <span className="font-bold text-gray-900">Dr. {apt.doctor?.user?.name}</span>
                                            <span className="text-xs text-gray-500">• {apt.appointmentDate}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {apt.preVisitSummary && (
                                                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-sm">
                                                    <span className="block font-semibold text-blue-800 mb-1 text-xs uppercase tracking-wider">AI Pre-Visit Note</span>
                                                    <p className="text-gray-700">{apt.preVisitSummary}</p>
                                                </div>
                                            )}
                                            {apt.postVisitSummary && (
                                                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 text-sm">
                                                    <span className="block font-semibold text-green-800 mb-1 text-xs uppercase tracking-wider">AI Post-Visit Care Summary</span>
                                                    <p className="text-gray-700 leading-relaxed">{apt.postVisitSummary}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}