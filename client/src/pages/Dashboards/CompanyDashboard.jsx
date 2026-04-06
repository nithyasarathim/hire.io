import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import axiosInstance from "../../api/axiosInstance";
import Logo from "../../assets/logo.png";
import {
  NotificationProvider,
  useNotification,
} from "../../components/NotificationBar";
import { FileText, CheckCircle, ExternalLink, Sparkles, X } from "lucide-react";
import { createJob, fetchCandidatesFromNeuron } from "../../api/company.api";

const CreateJobModal = ({ isOpen, onClose, onJobCreated, companyId }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_name: "",
    job_description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJob({
        ...formData,
        company: companyId,
        opening_status: "open",
      });
      notify("Job posted successfully", "success");
      onJobCreated();
      onClose();
      setFormData({ job_name: "", job_description: "" });
    } catch (err) {
      notify(err.message || "Failed to create job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden font-['Nunito']">
        <div className="bg-[#00aaff] px-5 py-3 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Create Job</h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            required
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#00aaff] text-md"
            placeholder="Job Title"
            value={formData.job_name}
            onChange={(e) =>
              setFormData({ ...formData, job_name: e.target.value })
            }
          />
          <textarea
            required
            rows={4}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#00aaff] resize-none text-md"
            placeholder="Job Description"
            value={formData.job_description}
            onChange={(e) =>
              setFormData({ ...formData, job_description: e.target.value })
            }
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00aaff] text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition text-md"
          >
            {loading ? "Posting..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

const CompanyDashboardContent = () => {
  const { user, logout } = useAuth();
  const notify = useNotification();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("matches");
  const [candidateCount, setCandidateCount] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/api/jobs");
      const myJobs = res.data.filter(
        (j) => (j.company?._id || j.company) === user?._id,
      );
      setJobs(myJobs);
      if (myJobs.length > 0 && !selectedJob) setSelectedJob(myJobs[0]);
    } catch (err) {
      notify("Failed to load jobs", "error");
    }
  };

  const fetchMatches = async (jobId) => {
    try {
      const response = await fetchCandidatesFromNeuron(jobId, candidateCount);
      if (response && response.candidates) setCandidates(response.candidates);
      else setCandidates([]);
    } catch (err) {
      setCandidates([]);
      if (err.message?.includes("not open"))
        notify("Job status mismatch", "warning");
    }
  };

  useEffect(() => {
    if (user?._id) fetchJobs();
  }, [user]);
  useEffect(() => {
    if (selectedJob?._id) fetchMatches(selectedJob._id);
  }, [selectedJob, candidateCount]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Nunito']">
      <header className=" max-w-[1400px] mx-auto mt-5 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <img src={Logo} alt="HIRE.IO" className="h-8" />
        <div className="flex items-center gap-4">
          <span className="text-[#2d405e] font-bold text-md hidden sm:block">
            {user?.company_name}
          </span>
          <button
            onClick={logout}
            className="bg-[#ff7675] text-white px-4 py-1.5 rounded-lg font-bold text-md hover:bg-[#ff5e5d] transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6">
        <h1 className="text-2xl font-extrabold text-[#2d405e] mb-6">
          Welcome, {user?.company_name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#00aaff] text-white py-3 rounded-xl font-black text-lg shadow hover:brightness-105 transition"
            >
              Create Job
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#00aaff] px-5 py-4 flex justify-between items-center text-white">
                <h2 className="text-lg font-black tracking-tight">
                  Current Openings
                </h2>
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  ({jobs.length})
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 cursor-pointer border-l-4 transition-all flex justify-between items-center border-b border-gray-50 ${selectedJob?._id === job._id ? "border-l-[#00aaff] bg-[#f0f9ff]" : "border-l-transparent hover:bg-gray-50"}`}
                  >
                    <span className="font-bold text-[#2d405e] text-md truncate pr-2">
                      {job.job_name}
                    </span>
                    <span className="bg-[#e1f5fe] text-[#00aaff] text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                      {job.opening_status || "open"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border shadow-sm flex flex-col min-h-[600px] overflow-hidden">
            <div className="px-4 py-3 flex gap-3 bg-[#f8f9fa] border-b">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition ${activeTab === "description" ? "bg-white text-[#2d405e] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                <FileText size={14} /> Job Description
              </button>
              <button
                onClick={() => setActiveTab("matches")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition ${activeTab === "matches" ? "bg-[#00aaff] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Sparkles size={14} /> Matching Profiles
              </button>
            </div>

            <div className="p-6 flex-1">
              {activeTab === "description" ? (
                <div className="text-[#2d405e]">
                  <h2 className="text-xl font-black mb-3">
                    {selectedJob?.job_name}
                  </h2>
                  <p className="whitespace-pre-wrap text-md leading-relaxed opacity-80">
                    {selectedJob?.job_description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#f0fff4]/60 border border-[#c6f6d5] px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-2 text-[#38a169] font-black text-md">
                      <Sparkles size={16} /> Matching Profiles
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Show Top:
                      </span>
                      <select
                        value={candidateCount}
                        onChange={(e) => setCandidateCount(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-[#2d405e]"
                      >
                        <option value={5}>5 Candidates</option>
                        <option value={10}>10 Candidates</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {candidates.map((can, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-black text-[#2d405e] truncate pr-4">
                            {can.username}
                          </h3>
                          <div className="text-right shrink-0">
                            <span className="bg-[#f0fff4] text-[#38a169] px-3 py-0.5 rounded-full text-[10px] font-black border border-[#c6f6d5] mb-1 inline-block">
                              {can.match}
                            </span>
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-xl font-black text-[#38a169]">
                                {Math.round(can.accuracy)}%
                              </span>
                              <span className="text-[8px] text-gray-400 font-bold uppercase">
                                Match
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="flex-1 bg-[#00b894] text-white py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 hover:brightness-105 transition">
                            <CheckCircle size={14} /> Hire
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                `http://localhost:8001/resumes/${can.resume}`,
                                "_blank",
                              )
                            }
                            className="flex-1 bg-[#00aaff] text-white py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 hover:brightness-105 transition shadow-sm"
                          >
                            <FileText size={14} /> Resume{" "}
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {candidates.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-md italic">
                        No matching profiles found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobCreated={fetchJobs}
        companyId={user?._id}
      />
    </div>
  );
};

const CompanyDashboard = () => (
  <NotificationProvider>
    <CompanyDashboardContent />
  </NotificationProvider>
);

export default CompanyDashboard;
