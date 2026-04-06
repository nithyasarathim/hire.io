import axiosInstance from './axiosInstance';

export const updateStudentProfile = (studentId, updateData) => {
  return axiosInstance.patch(`/api/students/${studentId}`, updateData);
};

export const uploadStudentResume = (studentId, resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  return axiosInstance.put(`/api/students/${studentId}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const fetchStudentMatches = async (studentId, count) => {
  try {
    const response = await axiosInstance.get(`/api/students/${studentId}/match/jobs`, {
      params: count,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || new Error('Error fetching job matches');
  }
};

export const applyToJob = async (jobId) => {
  try {
    const response = await axiosInstance.post(`/api/applications/jobs/${jobId}/apply`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Error applying to job');
  }
};

export const fetchMyApplications = async () => {
  try {
    const response = await axiosInstance.get('/api/applications/me');
    return response.data.applications || [];
  } catch (error) {
    throw error.response?.data || new Error('Error fetching applications');
  }
};

