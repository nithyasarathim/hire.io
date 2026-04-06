import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import Logo from "../../assets/logo.png";
import ProfileModal from "../../components/ProfileModal";
import {
  NotificationProvider,
  useNotification,
} from "../../components/NotificationBar";
import {
  User,
  FileUp,
  Building2,
  MapPin,
  SlidersHorizontal,
  BadgeCheck,
} from "lucide-react";
import {
  applyToJob,
  fetchMyApplications,
  fetchStudentMatches,
} from "../../api/student.api";

const MatchBadge = ({ match }) => {
  const palette = {
    "Excellent Match": "bg-emerald-100 text-emerald-700",
    "Very Good Match": "bg-emerald-700 text-white",
    "Good Match": "bg-emerald-700 text-white",
    "Fair Match": "bg-amber-100 text-amber-800",
    "Moderate Match": "bg-amber-100 text-amber-800",
    "Limited Match": "bg-blue-100 text-blue-700",
    "Minimal Match": "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${palette[match] || "bg-gray-100 text-gray-700"}`}
    >
      {match || "Unknown"}
    </span>
  );
};

const MatchModal = ({ job, onClose, onApply, applying }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between">
          <div className="pr-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
              Skill Match
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 break-words">
              {job.job_title}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {job.company} · {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Match Strength */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Match Strength
              </span>
              <span className="text-sm font-bold text-sky-600">
                {Math.round(job.accuracy || 0)}%
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(job.accuracy || 0, 100)}%` }}
              />
            </div>

            <div className="mt-3">
              <MatchBadge match={job.match} />
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700 mb-3">
                Matched Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {(job.matched_skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-700 mb-3">
                Skills To Acquire
              </p>
              <div className="flex flex-wrap gap-2">
                {(job.missing_skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-slate-600 whitespace-pre-line leading-7 text-sm md:text-base">
            {job.description}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 w-full sm:w-auto"
          >
            Close
          </button>

          <button
            onClick={() => onApply(job)}
            disabled={applying || !!job.application_status}
            className="px-5 py-2 rounded-xl bg-sky-500 text-white font-semibold disabled:opacity-50 w-full sm:w-auto"
          >
            {job.application_status
              ? job.application_status
              : applying
                ? "Applying..."
                : "Express Interest"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentDashboardContent = () => {
  const { user } = useAuth();
  const notify = useNotification();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("matches");
  const [matchModalJob, setMatchModalJob] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [filters, setFilters] = useState({
    count: 8,
    currency: "",
    minSalary: "",
    maxSalary: "",
  });

  const hasResume = !!user?.resumeId;

  const learningPath = useMemo(
    () =>
      Array.from(
        new Set(jobs.slice(0, 5).flatMap((job) => job.missing_skills || [])),
      ),
    [jobs],
  );

  const loadMatches = async () => {
    if (!user?._id || !hasResume) return;
    setLoading(true);
    try {
      const data = await fetchStudentMatches(user._id, filters);
      setJobs(data.matches || []);
      setSelectedJob((data.matches || [])[0] || null);
    } catch (err) {
      notify(err.message || "Failed to fetch job recommendations", "error");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplications(await fetchMyApplications());
    } catch (err) {
      notify(err.message || "Failed to fetch applications", "error");
    }
  };

  useEffect(() => {
    loadMatches();
  }, [
    user?._id,
    user?.resumeId,
    filters.count,
    filters.currency,
    filters.minSalary,
    filters.maxSalary,
  ]);

  useEffect(() => {
    if (user?._id) loadApplications();
  }, [user?._id]);

  const handleApply = async (job) => {
    try {
      setApplyingJobId(job.mongo_job_id);
      await applyToJob(job.mongo_job_id);
      notify("Interest sent to company", "success");
      setMatchModalJob(null);
      await Promise.all([loadMatches(), loadApplications()]);
    } catch (err) {
      notify(err.message || "Unable to apply", "error");
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_45%,#fff8ef_100%)]">
      <header className="border-b border-white/70 backdrop-blur-sm bg-white/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <img src={Logo} alt="logo" className="h-9 w-auto" />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2.5 bg-sky-500 text-white px-5 py-2.5 rounded-2xl shadow-md"
          >
            <User size={18} />
            <span className="font-medium">Profile</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-[28px] bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 text-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-100">
              Student Command Center
            </p>

            <h1 className="text-3xl font-bold mt-2 leading-tight">
              Skill-first opportunities for {user?.name}
            </h1>

            <p className="text-sky-100/90 mt-3 max-w-2xl">
              Track fit, close skill gaps, and express interest with one click.
            </p>
          </div>

          <div className="rounded-[28px] bg-white shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-semibold text-slate-500">
              Learning Path
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {learningPath.length > 0 ? (
                learningPath.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  Upload a resume to unlock recommendations.
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2 text-slate-700 font-semibold pr-2 pb-2">
            <SlidersHorizontal size={18} />
            Salary Filter
          </div>
          <select
            value={filters.currency}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, currency: e.target.value }))
            }
            className="px-3 py-2 rounded-xl border border-slate-200"
          >
            <option value="">All currencies</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          <input
            value={filters.minSalary}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minSalary: e.target.value }))
            }
            placeholder="Min salary"
            className="px-3 py-2 rounded-xl border border-slate-200"
          />
          <input
            value={filters.maxSalary}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxSalary: e.target.value }))
            }
            placeholder="Max salary"
            className="px-3 py-2 rounded-xl border border-slate-200"
          />
          <select
            value={filters.count}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, count: Number(e.target.value) }))
            }
            className="px-3 py-2 rounded-xl border border-slate-200"
          >
            {[6, 8, 12, 16].map((value) => (
              <option key={value} value={value}>
                Top {value}
              </option>
            ))}
          </select>
        </section>

        <section className="flex gap-3">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-2 rounded-2xl font-semibold ${activeTab === "matches" ? "bg-sky-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Top Matches
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-2xl font-semibold ${activeTab === "applications" ? "bg-sky-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            My Applications
          </button>
        </section>

        {activeTab === "matches" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="rounded-[28px] bg-white p-6 border border-slate-100">
                  Loading matches...
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <button
                    key={job.job_id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left rounded-[28px] p-5 border transition ${selectedJob?.job_id === job.job_id ? "bg-sky-50 border-sky-200 shadow-md" : "bg-white border-slate-100 hover:border-sky-100"}`}
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {job.job_title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {job.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-sky-600">
                          {Math.round(job.accuracy || 0)}%
                        </p>
                        <MatchBadge match={job.match} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={14} />
                      {job.location}
                    </div>
                    <div className="mt-3 text-sm text-slate-700">
                      {job.salary_currency} {job.salary_start} -{" "}
                      {job.salary_end}
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[28px] bg-white p-8 border border-slate-100 text-center text-slate-500">
                  {hasResume
                    ? "No matches for this salary filter."
                    : "Upload a resume to unlock matching."}
                </div>
              )}
            </div>
            <div className="lg:col-span-3 rounded-[32px] bg-white border border-slate-100 shadow-sm p-6">
              {selectedJob ? (
                <div className="space-y-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {selectedJob.job_title}
                      </h2>
                      <div className="mt-2 flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={16} />
                          {selectedJob.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {selectedJob.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-sky-600">
                        {Math.round(selectedJob.accuracy || 0)}%
                      </div>
                      <div className="mt-2">
                        <MatchBadge match={selectedJob.match} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        Salary
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {selectedJob.salary_currency} {selectedJob.salary_start}{" "}
                        - {selectedJob.salary_end}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        Type
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {selectedJob.job_type}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        Experience
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">
                        {selectedJob.experience_level}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-600 leading-7 whitespace-pre-line">
                    {selectedJob.description}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.skills_required || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMatchModalJob(selectedJob)}
                      className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-semibold"
                    >
                      Open Match Modal
                    </button>
                    <button
                      onClick={() => handleApply(selectedJob)}
                      disabled={
                        applyingJobId === selectedJob.mongo_job_id ||
                        !!selectedJob.application_status
                      }
                      className="px-5 py-3 rounded-2xl bg-sky-500 text-white font-semibold disabled:opacity-50"
                    >
                      {selectedJob.application_status
                        ? selectedJob.application_status
                        : applyingJobId === selectedJob.mongo_job_id
                          ? "Applying..."
                          : "Apply / Interested"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  {hasResume ? (
                    "Select a role to explore the match breakdown."
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileUp size={18} />
                      Upload a resume to start matching.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-semibold">
              <BadgeCheck size={18} />
              My Applications
            </div>
            <div className="divide-y divide-slate-100">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <div
                    key={application._id}
                    className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {application.job?.job_name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {application.company?.company_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                        {application.status}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {application.engagement_type}
                      </span>
                      {application.company_viewed_profile_at && (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                          Profile Viewed
                        </span>
                      )}
                      {application.company_contacted_at && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          Contacted
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-slate-400">
                  No applications yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ProfileModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <MatchModal
        job={matchModalJob}
        onClose={() => setMatchModalJob(null)}
        onApply={handleApply}
        applying={applyingJobId === matchModalJob?.mongo_job_id}
      />
    </div>
  );
};

const StudentDashboard = () => (
  <NotificationProvider>
    <StudentDashboardContent />
  </NotificationProvider>
);

export default StudentDashboard;
