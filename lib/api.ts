import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Patient {
  id: number;
  nama: string;
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_telepon: string;
  email?: string;
  golongan_darah: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  nama: string;
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_telepon: string;
  email?: string;
  golongan_darah: string;
}

export interface ApiError {
  success: boolean;
  statusCode: number;
  message: string;
  errors?: string[];
}

// GET semua pasien
export const getAllPatients = async (): Promise<Patient[]> => {
  const response = await api.get('/patients');
  return response.data;
};

// GET pasien by ID
export const getPatientById = async (id: number): Promise<Patient> => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

// POST tambah pasien baru
export const createPatient = async (data: CreatePatientData): Promise<Patient> => {
  const response = await api.post('/patients', data);
  return response.data;
};

// PATCH update pasien
export const updatePatient = async (id: number, data: Partial<CreatePatientData>): Promise<Patient> => {
  const response = await api.patch(`/patients/${id}`, data);
  return response.data;
};

// DELETE hapus pasien
export const deletePatient = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

// SEARCH cari pasien
export const searchPatients = async (keyword: string): Promise<Patient[]> => {
  const response = await api.get(`/patients/search?q=${keyword}`);
  return response.data;
};

export default api;
