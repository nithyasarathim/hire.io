import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import Logo from '../../assets/logo.png';
import ProfileModal from '../../components/ProfileModal';
import { NotificationProvider, useNotification } from '../../components/NotificationBar';
import { User, FileUp, Briefcase, Building2, MapPin, Sparkles } from 'lucide-react';
import { fetchJobsFromNeuron } from '../../api/student.api'

const JobCardSkeleton = () => (
  <div className="animate-pulse p-4 border-l-4 border-transparent">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);

const getMatchBadge = (match) => {
    switch (match) {
      case 'Excellent Match':
        return { text: match, color: 'bg-emerald-100 text-emerald-700' };
      case 'Very Good Match':
      case 'Good Match':
        return { text: match, color: 'bg-emerald-700 text-white' };
      case 'Fair Match':
      case 'Moderate Match':
        return { text: match, color: 'bg-amber-100 text-amber-800' }; 
      case 'Limited Match':
        return { text: match, color: 'bg-blue-100 text-blue-700' }; 
      case 'Minimal Match':
        return { text: match, color: 'bg-red-100 text-red-700' };
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
  };  
  

const StudentDashboardContent = () => {
  const { user } = useAuth();
  const notify = useNotification();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [jobCount, setJobCount] = useState(5);

  const resumeId = user?.resumeId;
  const hasResume = !!resumeId;

  useEffect(() => {
    if (!hasResume) return;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await fetchJobsFromNeuron(resumeId, jobCount);
        const matches = Array.isArray(data.matches) ? data.matches : [];
        setJobs(matches);
        setSelectedJob(matches[0] ?? null);
      } catch (err) {
        console.error(err);
        notify(err.message || 'Failed to fetch job recommendations', 'error');
        setJobs([]);
        setSelectedJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [hasResume, resumeId, jobCount, notify]);

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="logo" className="h-9 w-auto" />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2.5 bg-sky-500 text-white px-5 py-2.5 rounded-xl hover:bg-sky-600 transition-all duration-200 shadow-md"
          >
            <User size={18} />
            <span className="font-medium">Profile</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-sky-500 p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} />
                Top Matches
              </h2>
              <span className="text-sm opacity-90">({jobs.length})</span>
            </div>
            {hasResume && (
              <select
                value={jobCount}
                onChange={(e) => setJobCount(parseInt(e.target.value, 10))}
                className="mt-3 w-full bg-white/20 border border-white rounded-lg px-5 py-1.5 text-sm text-black focus:outline-none"
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n} className="text-gray-800">
                    Top {n} Jobs
                  </option>
                ))}
              </select>
            )}

            <div className="max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              ) : jobs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {jobs.map((job) => {
                    const isSelected = selectedJob?.job_id === job.job_id;
                    return (
                      <div
                        key={job.job_id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-sky-50 border-l-4 border-sky-500 shadow-sm'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {job.job_title || 'Untitled Role'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{job.company || 'Unknown Company'}</p>
                        <div className="flex items-center w-fit h-fit bg-white gap-3 mt-2 text-xs bg-white">
                          <span className="font-medium text-sky-700">
                            {job.accuracy ? `${job.accuracy.toFixed(1)}%` : '—'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${getMatchBadge(job.match).color}`}
                          >
                            {getMatchBadge(job.match).text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="bg-gray-100 border-2 border-dashed rounded-xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Briefcase size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No job matches found</p>
                  <p className="text-sm text-gray-400 mt-1">Try refining your resume!</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Job Details */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 relative">
            {hasResume ? (
              selectedJob ? (
                <div className="h-[70vh] overflow-y-auto pr-3 space-y-6">
                  {/* Hide Scrollbar */}
                  <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                  {/* Top Right Accuracy & Match */}
                  <div className="absolute bg-white p-1 rounded-lg top-6 right-6 text-right">
                    <div className="text-3xl font-bold text-sky-600">
                      {selectedJob.accuracy ? `${selectedJob.accuracy.toFixed(0)}%` : '—'}
                    </div>
                    <div
                      className={`mt-1 inline-block px-3 py-1 text-xs font-semibold rounded-full ${getMatchBadge(
                        selectedJob.match
                      ).color}`}
                    >
                      {getMatchBadge(selectedJob.match).text}
                    </div>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedJob.job_title || 'Job Title'}</h1>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-lg font-semibold text-sky-700 flex items-center gap-1">
                        <Building2 size={18} className="text-sky-600" />
                        {selectedJob.company || 'Unknown Company'}
                      </p>
                      {selectedJob.location && (
                        <p className="text-gray-600 flex items-center gap-1">
                          <MapPin size={16} className="text-sky-500" />
                          {selectedJob.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedJob.skills_required && (
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills_required.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedJob.description || 'No detailed description available for this job posting.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    {selectedJob.experience && (
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                          Experience
                        </p>
                        <p className="mt-1 text-sm text-gray-800">{selectedJob.experience}</p>
                      </div>
                    )}
                    {selectedJob.salary && (
                      <div className="bg-emerald-50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                          Salary
                        </p>
                        <p className="mt-1 text-sm text-gray-800 font-medium">{selectedJob.salary}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gray-100 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-5 flex items-center justify-center">
                    <Briefcase size={40} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Select a job to view details</p>
                </div>
              )
            ) : (
              <div className="text-center py-16 px-6">
                <div className="bg-sky-100 rounded-full w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                  <FileUp size={48} className="text-sky-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Your Resume</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Unlock personalized job recommendations powered by AI. Get matched with roles that fit your skills and experience.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-sky-600 transition-all shadow-lg"
                >
                  <FileUp size={18} />
                  Upload Resume Now
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <ProfileModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

const StudentDashboard = () => (
  <NotificationProvider>
    <StudentDashboardContent />
  </NotificationProvider>
);

export default StudentDashboard;
