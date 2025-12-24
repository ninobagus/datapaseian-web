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

export interface PatientFormData {
  nama: string;
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_telepon: string;
  email: string;
  golongan_darah: string;
}

export interface FormErrors {
  [key: string]: string;
}
