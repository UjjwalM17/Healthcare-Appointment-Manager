import { useState, useRef, useEffect } from "react";
import API from "../services/api";

export default function AdminDashboard({ activeTab }) {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        specialization: "",
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        slotDurationMinutes: 30
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const isSubmitting = useRef(false);

    // Leave Management
    const [leaveDoctorId, setLeaveDoctorId] = useState("");
    const [leaveDate, setLeaveDate] = useState("");
    const [leaveMsg, setLeaveMsg] = useState("");
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        if (activeTab === 'configurations') {
            API.get("/api/doctors").then(res => setDoctors(res.data)).catch(console.error);
        }
    }, [activeTab]);

    const createDoctor = async () => {
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setLoading(true);

        try {
            // Step 1: Register the Doctor as a new User
            const userRes = await API.post("/api/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: "DOCTOR"
            });
            
            const newUserId = userRes.data.id;

            // Step 2: Create the Doctor Profile linked to the new User
            const request = {
                user: { id: newUserId },
                specialization: form.specialization,
                workingHoursStart: form.workingHoursStart,
                workingHoursEnd: form.workingHoursEnd,
                slotDurationMinutes: parseInt(form.slotDurationMinutes),
                leaveDays: []
            };

            await API.post("/api/admin/doctors", request);
            
            setMessage("Doctor user and profile created successfully!");
            setForm({
                name: "",
                email: "",
                password: "",
                specialization: "",
                workingHoursStart: "09:00",
                workingHoursEnd: "17:00",
                slotDurationMinutes: 30
            });
            setTimeout(() => setMessage(""), 5000);
        } catch (e) {
            setMessage(e.response?.data || "Failed to create doctor profile. Check if email already exists.");
        } finally {
            isSubmitting.current = false;
            setLoading(false);
        }
    };

    const markLeave = async () => {
        if (!leaveDoctorId || !leaveDate) {
            setLeaveMsg("Doctor ID and Leave Date are required.");
            return;
        }

        try {
            await API.post(`/api/admin/doctors/${leaveDoctorId}/leave`, { date: leaveDate });
            setLeaveMsg("Leave marked successfully. Patients have been notified.");
            setLeaveDoctorId("");
            setLeaveDate("");
            setTimeout(() => setLeaveMsg(""), 5000);
        } catch (e) {
            setLeaveMsg(e.response?.data || "Failed to mark leave.");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Left Column: Create Doctor */}
            {activeTab === 'dashboard' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Create Doctor Profile</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Register a new physician in the system</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm mb-6 font-medium flex items-center gap-2 ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {message}
                        </div>
                    )}

                    <div className="space-y-5 flex-grow">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Doctor Name</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="e.g. John Doe"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Specialization</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="e.g. Cardiology"
                                    value={form.specialization}
                                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Email Address</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    type="email"
                                    placeholder="doctor@healthcare.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Temporary Password</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Start Time</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    type="time"
                                    value={form.workingHoursStart}
                                    onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">End Time</label>
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    type="time"
                                    value={form.workingHoursEnd}
                                    onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Slot Duration (mins)</label>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                type="number"
                                placeholder="30"
                                value={form.slotDurationMinutes}
                                onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <button
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all shadow-md flex justify-center items-center gap-2 ${
                                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                            }`}
                            disabled={loading}
                            onClick={createDoctor}
                        >
                            {loading ? (
                                <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Provisioning...</>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Create Doctor Profile</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Right Column: Leave Management */}
            {activeTab === 'configurations' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Manage Doctor Leave</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">Cancel and notify patients automatically</p>
                        </div>
                    </div>

                    {leaveMsg && (
                        <div className={`p-4 rounded-xl text-sm mb-6 font-medium flex items-center gap-2 ${leaveMsg.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {leaveMsg}
                        </div>
                    )}

                    <div className="space-y-5 flex-grow">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Select Doctor</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all appearance-none"
                                value={leaveDoctorId}
                                onChange={(e) => setLeaveDoctorId(e.target.value)}
                            >
                                <option value="" disabled>Select a doctor...</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.user?.name} ({doc.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Leave Date</label>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                type="date"
                                value={leaveDate}
                                onChange={(e) => setLeaveDate(e.target.value)}
                            />
                        </div>
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 mt-6">
                            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Warning
                            </h4>
                            <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                                Marking leave will automatically cancel all appointments for this doctor on the selected date. Connected Google Calendar events will be deleted, and patients will be notified via email immediately.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <button
                            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                            onClick={markLeave}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Confirm Leave & Trigger Automation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}