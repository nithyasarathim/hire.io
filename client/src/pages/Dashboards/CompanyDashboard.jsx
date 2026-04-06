import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import axiosInstance from "../../api/axiosInstance";
import Logo from "../../assets/logo.png";
import { NotificationProvider, useNotification } from "../../components/NotificationBar";
import { ExternalLink, Mail, Sparkles, X, Users, BriefcaseBusiness } from "lucide-react";
import { contactCandidate, createJob, fetchApplicantAnalytics, fetchCandidatesFromNeuron, fetchCompanyApplications, markCandidateViewed } from "../../api/company.api";

const MatchModal = ({ candidate, job, onClose, onView, onContact }) => {
  if (!candidate || !job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-[28px] bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-500">Top Match</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{candidate.username}</h2>
            <p className="text-slate-500 mt-1">{job.job_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Similarity Score</span>
              <span className="text-lg font-bold text-sky-600">{Math.round(candidate.accuracy || 0)}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${Math.min(candidate.accuracy || 0, 100)}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700 mb-2">Matched Skills</p>
              <div className="flex flex-wrap gap-2">
                {(candidate.matched_skills || []).map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">{skill}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-700 mb-2">Skill Gaps</p>
              <div className="flex flex-wrap gap-2">
                {(candidate.missing_skills || []).map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600">Close</button>
          <button onClick={onView} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold">Mark Viewed</button>
          <button onClick={onContact} className="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold">Contact Candidate</button>
        </div>
      </div>
    </div>
  );
};

const CreateJobModal = ({ isOpen, onClose, onJobCreated, companyId }) => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    job_name: "",
    job_description: "",
    location: "",
    job_type: "Full-time",
    salary_start: "",
    salary_end: "",
    salary_currency: "INR",
    experience_level: "",
    skills_required: "",
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
        salary_start: Number(formData.salary_start),
        salary_end: Number(formData.salary_end),
        skills_required: formData.skills_required.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      notify("Job posted successfully", "success");
      onJobCreated();
      onClose();
      setFormData({
        job_name: "",
        job_description: "",
        location: "",
        job_type: "Full-time",
        salary_start: "",
        salary_end: "",
        salary_currency: "INR",
        experience_level: "",
        skills_required: "",
      });
    } catch (err) {
      notify(err.message || "Failed to create job", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Create Job</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required className="md:col-span-2 w-full border rounded-xl px-3 py-3" placeholder="Job Title" value={formData.job_name} onChange={(e) => setFormData({ ...formData, job_name: e.target.value })} />
          <textarea required rows={5} className="md:col-span-2 w-full border rounded-xl px-3 py-3 resize-none" placeholder="Job Description" value={formData.job_description} onChange={(e) => setFormData({ ...formData, job_description: e.target.value })} />
          <input required className="w-full border rounded-xl px-3 py-3" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <select required className="w-full border rounded-xl px-3 py-3" value={formData.job_type} onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
          </select>
          <input required type="number" min="0" className="w-full border rounded-xl px-3 py-3" placeholder="Salary Start" value={formData.salary_start} onChange={(e) => setFormData({ ...formData, salary_start: e.target.value })} />
          <input required type="number" min="0" className="w-full border rounded-xl px-3 py-3" placeholder="Salary End" value={formData.salary_end} onChange={(e) => setFormData({ ...formData, salary_end: e.target.value })} />
          <select required className="w-full border rounded-xl px-3 py-3" value={formData.salary_currency} onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <input required className="w-full border rounded-xl px-3 py-3" placeholder="Experience Level" value={formData.experience_level} onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })} />
          <input required className="md:col-span-2 w-full border rounded-xl px-3 py-3" placeholder="Required Skills (comma separated)" value={formData.skills_required} onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })} />
          <button type="submit" disabled={loading} className="md:col-span-2 w-full bg-sky-500 text-white py-3 rounded-xl font-bold">
            {loading ? "Posting..." : "Publish Job"}
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
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState({ average_match_score: 0, total_applications: 0 });
  const [candidateCount, setCandidateCount] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const topGallery = useMemo(() => candidates.slice(0, 3), [candidates]);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/api/jobs");
      const myJobs = res.data.filter((j) => (j.company?._id || j.company) === user?._id);
      setJobs(myJobs);
      setSelectedJob((prev) => prev || myJobs[0] || null);
    } catch {
      notify("Failed to load jobs", "error");
    }
  };

  const fetchMatches = async (jobId) => {
    try {
      const response = await fetchCandidatesFromNeuron(jobId, candidateCount);
      setCandidates(response.candidates || []);
    } catch (err) {
      notify(err.message || "Unable to fetch candidates", "error");
      setCandidates([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetchApplicantAnalytics(user?._id);
      setAnalytics(response.analytics || { average_match_score: 0, total_applications: 0 });
    } catch {
      setAnalytics({ average_match_score: 0, total_applications: 0 });
    }
  };

  const fetchApplications = async () => {
    try {
      setApplications(await fetchCompanyApplications(user?._id));
    } catch {
      setApplications([]);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchJobs();
      fetchAnalytics();
      fetchApplications();
    }
  }, [user?._id]);

  useEffect(() => {
    if (selectedJob?._id) {
      fetchMatches(selectedJob._id);
    }
  }, [selectedJob?._id, candidateCount]);

  const handleViewCandidate = async (candidate = selectedCandidate) => {
    try {
      await markCandidateViewed(selectedJob._id, candidate.student_id);
      notify("Candidate view tracked", "success");
      await fetchApplications();
      await fetchMatches(selectedJob._id);
    } catch (err) {
      notify(err.message || "Unable to track candidate view", "error");
    }
  };

  const handleContactCandidate = async (candidate = selectedCandidate) => {
    try {
      await contactCandidate(selectedJob._id, candidate.student_id);
      window.location.href = `mailto:${candidate.student_email}?subject=${encodeURIComponent(`Opportunity at ${user?.company_name}`)}`;
      notify("Candidate contact tracked", "success");
      await fetchApplications();
      await fetchMatches(selectedJob._id);
    } catch (err) {
      notify(err.message || "Unable to contact candidate", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#fcfdff_0%,#eef6ff_50%,#f7fbf3_100%)]">
      <header className="max-w-[1400px] mx-auto px-6 py-5 flex justify-between items-center">
        <img src={Logo} alt="HIRE.IO" className="h-8" />
        <div className="flex items-center gap-4">
          <span className="text-slate-700 font-bold hidden sm:block">{user?.company_name}</span>
          <button onClick={logout} className="bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold">Logout</button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-[28px] bg-slate-950 text-white p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Company Intelligence</p>
            <h1 className="text-3xl font-bold mt-2">Skill-based recruiting, sharpened</h1>
            <p className="text-slate-300 mt-3">View your strongest matches, outreach history, and applicant quality in one place.</p>
          </div>
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-sm p-6">
            <p className="text-sm font-semibold text-slate-500">Average Match Score</p>
            <p className="text-4xl font-bold text-sky-600 mt-2">{Math.round(analytics.average_match_score || 0)}%</p>
            <p className="text-sm text-slate-400 mt-2">{analytics.total_applications || 0} tracked applications</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <button onClick={() => setActiveTab("gallery")} className={`px-4 py-2 rounded-2xl font-semibold ${activeTab === 'gallery' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Top Matches</button>
          <button onClick={() => setActiveTab("applications")} className={`px-4 py-2 rounded-2xl font-semibold ${activeTab === 'applications' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Applications</button>
          <button onClick={() => setIsModalOpen(true)} className="ml-auto px-4 py-2 rounded-2xl bg-slate-900 text-white font-semibold">Create Job</button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-[28px] bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <BriefcaseBusiness size={18} />
                Open Roles
              </div>
              <select value={candidateCount} onChange={(e) => setCandidateCount(Number(e.target.value))} className="px-2 py-1 rounded-lg border border-slate-200 text-sm">
                <option value={3}>Top 3</option>
                <option value={6}>Top 6</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <button key={job._id} onClick={() => setSelectedJob(job)} className={`w-full text-left px-5 py-4 ${selectedJob?._id === job._id ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'}`}>
                  <p className="font-semibold text-slate-900">{job.job_name}</p>
                  <p className="text-sm text-slate-500 mt-1">{job.location} · {job.job_type}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 rounded-[28px] bg-white border border-slate-100 shadow-sm p-6">
            {activeTab === "gallery" ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Sparkles size={18} />
                  Top Matches Gallery
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topGallery.length > 0 ? topGallery.map((candidate) => (
                    <div key={candidate.student_id} className="rounded-[24px] border border-slate-100 bg-[linear-gradient(160deg,#ffffff_0%,#f4fbff_100%)] p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-sky-500">Top Match</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">{candidate.username}</h3>
                      <p className="text-sm text-slate-500 mt-1">{Math.round(candidate.accuracy || 0)}% similarity</p>
                      <div className="h-2 rounded-full bg-slate-200 mt-4 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${Math.min(candidate.accuracy || 0, 100)}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(candidate.matched_skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">{skill}</span>
                        ))}
                      </div>
                      <button onClick={() => setSelectedCandidate(candidate)} className="mt-5 w-full rounded-2xl bg-slate-900 text-white py-2.5 font-semibold">Open Match Modal</button>
                    </div>
                  )) : <div className="md:col-span-3 text-center py-12 text-slate-400">Select a job to load candidate matches.</div>}
                </div>
                <div className="space-y-3">
                  {candidates.map((candidate) => (
                    <div key={candidate.student_id} className="rounded-[24px] border border-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{candidate.username}</h3>
                        <p className="text-sm text-slate-500 mt-1">{candidate.student_email}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">{Math.round(candidate.accuracy || 0)}%</span>
                        <button onClick={() => window.open(`http://localhost:8001/resumes/${candidate.resume}`, "_blank")} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 flex items-center gap-2">
                          Resume <ExternalLink size={14} />
                        </button>
                        <button onClick={() => handleContactCandidate(candidate)} className="px-4 py-2 rounded-xl bg-sky-500 text-white flex items-center gap-2">
                          <Mail size={14} />
                          Contact Candidate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Users size={18} />
                  Engagement Tracker
                </div>
                {applications.length > 0 ? applications.map((application) => (
                  <div key={application._id} className="rounded-[24px] border border-slate-100 p-5 flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{application.student?.student_name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{application.job?.job_name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">{application.status}</span>
                      {application.company_viewed_profile_at && <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">Viewed</span>}
                      {application.company_contacted_at && <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Contacted</span>}
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{application.engagement_type}</span>
                    </div>
                  </div>
                )) : <div className="text-center py-12 text-slate-400">No applications tracked yet.</div>}
              </div>
            )}
          </div>
        </section>
      </main>

      <CreateJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onJobCreated={fetchJobs} companyId={user?._id} />
      <MatchModal candidate={selectedCandidate} job={selectedJob} onClose={() => setSelectedCandidate(null)} onView={() => handleViewCandidate(selectedCandidate)} onContact={() => handleContactCandidate(selectedCandidate)} />
    </div>
  );
};

const CompanyDashboard = () => (
  <NotificationProvider>
    <CompanyDashboardContent />
  </NotificationProvider>
);

export default CompanyDashboard;
