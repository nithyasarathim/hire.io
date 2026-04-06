import axiosInstance from "./axiosInstance";

export const createJob = async (jobData) => {
  try {
    const response = await axiosInstance.post("/api/jobs", jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error creating job");
  }
};

export const fetchCandidatesFromNeuron = async (jobId, count = 5) => {
  try {
    const response = await axiosInstance.get(
      `/api/jobs/${jobId}/match/candidates`,
      {
        params: { count },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error fetching candidate matches");
  }
};

export const getAllStudents = async () => {
  try {
    const response = await axiosInstance.get("/api/students");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error fetching student profiles");
  }
};

export const getCompanyJobs = async (companyId) => {
  try {
    const response = await axiosInstance.get(`/api/companies/${companyId}`);
    return response.data.jobs;
  } catch (error) {
    throw error.response?.data || new Error("Error fetching company jobs");
  }
};

export const fetchApplicantAnalytics = async (companyId) => {
  try {
    const response = await axiosInstance.get(`/api/companies/${companyId}/analytics/applicants-average`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error fetching applicant analytics");
  }
};

export const markCandidateViewed = async (jobId, studentId) => {
  try {
    const response = await axiosInstance.post(`/api/applications/jobs/${jobId}/students/${studentId}/view`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error tracking candidate view");
  }
};

export const contactCandidate = async (jobId, studentId) => {
  try {
    const response = await axiosInstance.post(`/api/applications/jobs/${jobId}/students/${studentId}/contact`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error contacting candidate");
  }
};

export const fetchCompanyApplications = async (companyId) => {
  try {
    const response = await axiosInstance.get(`/api/applications/company/${companyId}`);
    return response.data.applications || [];
  } catch (error) {
    throw error.response?.data || new Error("Error fetching company applications");
  }
};
