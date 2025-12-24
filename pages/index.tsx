import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Patient, PatientFormData, FormErrors } from '../types/patient';
import { getAllPatients, createPatient, updatePatient, deletePatient } from '../lib/api';
import axios from 'axios';

const initialFormData: PatientFormData = {
  nama: '',
  nik: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  alamat: '',
  no_telepon: '',
  email: '',
  golongan_darah: '',
};

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      setErrorMessage('Gagal mengambil data pasien. Pastikan backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama tidak boleh kosong';
    }
    if (!formData.nik.trim()) {
      newErrors.nik = 'NIK tidak boleh kosong';
    } else if (!/^[0-9]+$/.test(formData.nik)) {
      newErrors.nik = 'NIK hanya boleh berisi angka';
    }
    if (!formData.tanggal_lahir) {
      newErrors.tanggal_lahir = 'Tanggal lahir tidak boleh kosong';
    }
    if (!formData.jenis_kelamin) {
      newErrors.jenis_kelamin = 'Jenis kelamin tidak boleh kosong';
    }
    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat tidak boleh kosong';
    }
    if (!formData.no_telepon.trim()) {
      newErrors.no_telepon = 'No telepon tidak boleh kosong';
    }
    if (!formData.golongan_darah) {
      newErrors.golongan_darah = 'Golongan darah tidak boleh kosong';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        await updatePatient(editingId, formData);
        setSuccessMessage('Data pasien berhasil diperbarui!');
      } else {
        await createPatient(formData);
        setSuccessMessage('Pasien baru berhasil ditambahkan!');
      }
      
      setFormData(initialFormData);
      setEditingId(null);
      setShowForm(false);
      fetchPatients();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data;
        if (apiError.errors && Array.isArray(apiError.errors)) {
          setErrorMessage(apiError.errors.join(', '));
        } else {
          setErrorMessage(apiError.message || 'Terjadi kesalahan');
        }
      } else {
        setErrorMessage('Terjadi kesalahan saat menyimpan data');
      }
    }
  };

  // Handle edit
  const handleEdit = (patient: Patient) => {
    setFormData({
      nama: patient.nama,
      nik: patient.nik,
      tanggal_lahir: patient.tanggal_lahir.split('T')[0],
      jenis_kelamin: patient.jenis_kelamin,
      alamat: patient.alamat,
      no_telepon: patient.no_telepon,
      email: patient.email || '',
      golongan_darah: patient.golongan_darah,
    });
    setEditingId(patient.id);
    setShowForm(true);
    setErrors({});
  };

  // Handle delete
  const handleDelete = async (id: number, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pasien ${nama}?`)) {
      try {
        await deletePatient(id);
        setSuccessMessage('Data pasien berhasil dihapus!');
        fetchPatients();
      } catch (error) {
        setErrorMessage('Gagal menghapus data pasien');
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Filter patients by search
  const filteredPatients = patients.filter(patient =>
    patient.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    patient.nik.includes(searchKeyword)
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Sistem Manajemen Pasien</title>
        <meta name="description" content="CRUD Pasien dengan NestJS dan NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏥 Sistem Manajemen Pasien
            </h1>
            <p className="text-gray-600">Kelola data pasien dengan mudah</p>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              ❌ {errorMessage}
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setFormData(initialFormData);
                setEditingId(null);
                setErrors({});
              }}
              className="btn-primary w-full md:w-auto"
            >
              {showForm ? '✕ Tutup Form' : '+ Tambah Pasien Baru'}
            </button>
            
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIK..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? '✏️ Edit Data Pasien' : '📝 Form Tambah Pasien'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className={`input-field ${errors.nama ? 'input-error' : ''}`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.nama && <p className="error-message">{errors.nama}</p>}
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      NIK <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleInputChange}
                      className={`input-field ${errors.nik ? 'input-error' : ''}`}
                      placeholder="Masukkan NIK (16 digit)"
                      maxLength={16}
                    />
                    {errors.nik && <p className="error-message">{errors.nik}</p>}
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleInputChange}
                      className={`input-field ${errors.tanggal_lahir ? 'input-error' : ''}`}
                    />
                    {errors.tanggal_lahir && <p className="error-message">{errors.tanggal_lahir}</p>}
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin}
                      onChange={handleInputChange}
                      className={`input-field ${errors.jenis_kelamin ? 'input-error' : ''}`}
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    {errors.jenis_kelamin && <p className="error-message">{errors.jenis_kelamin}</p>}
                  </div>

                  {/* No Telepon */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      No. Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="no_telepon"
                      value={formData.no_telepon}
                      onChange={handleInputChange}
                      className={`input-field ${errors.no_telepon ? 'input-error' : ''}`}
                      placeholder="Contoh: 081234567890"
                    />
                    {errors.no_telepon && <p className="error-message">{errors.no_telepon}</p>}
                  </div>

                  {/* Golongan Darah */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Golongan Darah <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="golongan_darah"
                      value={formData.golongan_darah}
                      onChange={handleInputChange}
                      className={`input-field ${errors.golongan_darah ? 'input-error' : ''}`}
                    >
                      <option value="">Pilih Golongan Darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    {errors.golongan_darah && <p className="error-message">{errors.golongan_darah}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-field ${errors.email ? 'input-error' : ''}`}
                      placeholder="Contoh: email@example.com"
                    />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                  </div>

                  {/* Alamat */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className={`input-field ${errors.alamat ? 'input-error' : ''}`}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                    />
                    {errors.alamat && <p className="error-message">{errors.alamat}</p>}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn-primary">
                    {editingId ? '💾 Update Data' : '💾 Simpan Data'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData(initialFormData);
                      setEditingId(null);
                      setErrors({});
                    }}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Patient List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">
                📋 Daftar Pasien ({filteredPatients.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p>Memuat data...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Tidak ada data pasien</p>
                <p className="text-sm">Klik "Tambah Pasien Baru" untuk menambahkan data</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">NIK</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tgl Lahir</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Jenis Kelamin</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">No. Telp</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Gol. Darah</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.nama}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{patient.nik}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(patient.tanggal_lahir)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{patient.jenis_kelamin}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{patient.no_telepon}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {patient.golongan_darah}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id, patient.nama)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>Patient Management System © 2025</p>
          </div>
        </div>
      </main>
    </>
  );
}
