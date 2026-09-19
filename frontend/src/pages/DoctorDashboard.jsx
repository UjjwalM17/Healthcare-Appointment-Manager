import { useState, useEffect } from 'react'
import API from '../services/api'

export default function DoctorDashboard({ userId, activeTab }) {
    const [appointments, setAppointments] = useState([])
    const [notes, setNotes] = useState({})
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await API.get(`/api/appointments/doctor/${userId}`)
            setAppointments(res.data)
        } catch (e) { console.error(e) }
    }

    const submitNotes = async (appointmentId) => {
        try {
            await API.put(`/api/appointments/${appointmentId}/notes?notes=${encodeURIComponent(notes[appointmentId] || '')}`)
            setMessage('Notes submitted and AI summary generated!')
            fetchAppointments()
            setTimeout(() => setMessage(''), 5000)
        } catch (e) { setMessage('Failed to submit notes') }
    }

    const today = new Date().toISOString().split('T')[0];
    const patientsToday = appointments.filter(a => a.appointmentDate === today).length;
    const pendingNotes = appointments.filter(a => !a.postVisitSummary).length;

    return (
        <div className="space-y-6">
            {/* Top Stat Cards - Always visible */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Patients Today</p>
                        <h4 className="text-2xl font-bold text-gray-900">{patientsToday}</h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Notes</p>
                        <h4 className="text-2xl font-bold text-gray-900">{pendingNotes}</h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Upcoming</p>
                        <h4 className="text-2xl font-bold text-gray-900">{appointments.length}</h4>
                    </div>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {/* Schedule Section - Shown on 'dashboard' and 'appointments' tabs */}
            {(activeTab === 'dashboard' || activeTab === 'appointments') && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></span>
                            My Schedule & Patients
                        </h3>
                    </div>
                    
                    {appointments.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <p className="text-gray-500 font-medium">No confirmed appointments yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {appointments.map(apt => (
                                <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col xl:flex-row gap-6">
                                    
                                    {/* Left: Patient Details & Pre-Visit */}
                                    <div className="xl:w-1/3 flex flex-col gap-4 border-b xl:border-b-0 xl:border-r border-gray-100 pb-6 xl:pb-0 xl:pr-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {apt.patient?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{apt.patient?.name}</h3>
                                                <div className="flex items-center text-gray-500 text-sm gap-1.5 mt-0.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    {apt.appointmentDate} at {apt.appointmentTime}
                                                </div>
                                            </div>
                                        </div>

                                        {apt.preVisitSummary && (
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-purple-100 text-purple-600 p-1 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></span>
                                                    <span className="font-bold text-purple-900 text-xs uppercase tracking-wider">AI Pre-Visit Insight</span>
                                                </div>
                                                <p className="text-sm text-purple-800 leading-relaxed">{apt.preVisitSummary}</p>
                                            </div>
                                        )}

                                        {apt.symptoms && !apt.preVisitSummary && (
                                            <div className="bg-gray-100 p-4 rounded-xl">
                                                <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Raw Symptoms</span>
                                                <p className="text-sm text-gray-700">{apt.symptoms}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Notes & Post-Visit Summary */}
                                    <div className="xl:w-2/3 flex flex-col space-y-4">
                                        {!apt.postVisitSummary ? (
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Notes & Prescription</label>
                                                <textarea 
                                                    className="flex-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none min-h-[120px] text-sm"
                                                    placeholder="Write your clinical notes here. The AI will translate them into a patient-friendly summary upon submission..."
                                                    value={notes[apt.id] || ''}
                                                    onChange={e => setNotes({...notes, [apt.id]: e.target.value})} 
                                                />
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                        Auto-generates summary
                                                    </span>
                                                    <button 
                                                        className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md"
                                                        onClick={() => submitNotes(apt.id)}
                                                    >
                                                        Submit & Generate
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col space-y-4">
                                                <div>
                                                    <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Your Original Notes</span>
                                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700">
                                                        {apt.doctorNotes}
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-green-100 text-green-600 p-1 rounded-md"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></span>
                                                        <span className="font-bold text-green-900 text-xs uppercase tracking-wider">AI Post-Visit Care Summary (Sent to Patient)</span>
                                                    </div>
                                                    <p className="text-sm text-green-800 leading-relaxed whitespace-pre-line">{apt.postVisitSummary}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}