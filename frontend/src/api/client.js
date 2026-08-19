import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};

export const fetchPreset = async (type) => {
  const response = await axios.get(`${API_BASE_URL}/presets/${type}`);
  return response.data;
};

export const fetchModelInfo = async () => {
  const response = await axios.get(`${API_BASE_URL}/model-info`);
  return response.data;
};

export const predictSingleSample = async (voiceFeatures) => {
  const response = await axios.post(`${API_BASE_URL}/predict`, voiceFeatures);
  return response.data;
};

export const predictCsvBatch = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/predict-csv`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
