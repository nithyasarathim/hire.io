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

const NEURON_SERVER_API = import.meta.env.VITE_NEURON_SERVER_API;

export const fetchJobsFromNeuron = async (resumeId, count) => {
  if (!NEURON_SERVER_API) throw new Error('VITE_NEURON_SERVER_API not set');

  const params = new URLSearchParams({ resumeId, count: count.toString() });
  const response = await fetch(`${NEURON_SERVER_API}/match/jobs?${params.toString()}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Neuron API error: ${response.status}`);
  }

  return response.json();
};

