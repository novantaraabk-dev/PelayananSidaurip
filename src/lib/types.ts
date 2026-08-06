
import { Timestamp } from "firebase/firestore";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  publishDate: Timestamp;
  authorName: string;
  imageUrl?: string;
};

export type PelayananDoc = {
  id: string;
  title: string;
  category: string;
  fileId: string;
  fileName: string;
  createdAt: Timestamp;
  link?: string;
};

export type News = {
  id: string;
  title: string;
  subtitle: string;
  content?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  mediaType?: 'photo' | 'video';
  date: string;
  author: string;
  isHeadline?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type Complaint = {
  id: string;
  description: string;
  submissionDate: Timestamp;
  summaryLLM: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  submitterAuthUid?: string;
  adminResponse?: string;
  reporterName?: string;
  reporterAddress?: string;
  phoneNumber?: string;
  email?: string;
};

export type LetterSubmissionData = {
  requesterName: string;
  nik: string;
  letterType: string;
  formData: Record<string, any>;
  files?: { fieldName: string; file: File }[];
};

export type UploadedFile = {
  fieldName: string;
  fileName: string;
  fileId: string;
}

export type LetterSubmission = {
  id:string;
  requesterName: string;
  nik: string;
  phoneNumber?: string;
  email?: string;
  letterType: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  formData: Record<string, any>;
  documentNumber?: string;
  fileLinks?: UploadedFile[];
  submissionData?: string;
  requestorAuthUid?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type Resident = {
  id: string;
  nik: string;
  noKk: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  placeOfBirth: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  relationshipToHeadOfFamily: string;
  maritalStatus: string;
  educationLevel: string;
  religion: string;
  occupation: string;
  bloodType: string;
  hasBirthCertificate: string;
  birthCertificateNumber: string;
  hasMarriageCertificate: string;
  marriageCertificateNumber: string;
  hasDivorceCertificate: string;
  divorceCertificateNumber: string;
  fatherName: string;
  motherName: string;
  createdAt?: any;
  updatedAt?: any;
};

export type CitizenProfile = {
  uid: string;
  phoneNumber: string;
  email: string;
  updatedAt: any;
};

export type KopSuratInfo = {
  letterheadImageUrl: string;
};

export type VillageLogoInfo = {
  logoImageUrl: string;
};

export type VillageProfileInfo = {
  description?: string;
  imageUrl?: string;
  youtubeVideoUrl?: string;
  kadesPhotoUrl?: string;
  pengaduanImageUrl?: string;
};

export type DriveSettingsInfo = {
  googleDriveLink: string;
  appsScriptUrl: string;
  rootFolderId: string;
};

// Tata Kelola Desa Types
export type ApbdesItem = {
  bidang: string;
  kodeRekening: string;
  kegiatan: string;
  volume: number;
  nominal: number;
  sumberAnggaran: string;
};

export type ApbdesData = {
  id: string;
  tahun: number;
  totalAnggaran: number;
  items: ApbdesItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type RealisasiApbdesItem = {
  bidang: string;
  kodeRekening: string;
  kegiatan: string;
  volume: number;
  nominal: number;
  sumberAnggaran: string;
};

export type RealisasiApbdesData = {
  id: string;
  tahun: number;
  totalRealisasi: number;
  items: RealisasiApbdesItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ProdukHukumDesa = {
  id: string;
  jenis: 'perdes' | 'perkades' | 'rpjmdes' | 'rkpdes' | 'sk_desa' | 'lppd' | 'lkpd';
  tahun: number;
  nama: string;
  nomor: string;
  filePdfUrl?: string;
  filePdfId?: string;
  driveLink?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type FooterLogosInfo = {
  logo1Url?: string;
  logo2Url?: string;
  logo3Url?: string;
  logo4Url?: string;
  logo1Link?: string;
  logo2Link?: string;
  logo3Link?: string;
  logo4Link?: string;
};

export type PotensiDesa = {
  id: string;
  category: 'pariwisata-kebudayaan' | 'umkm-industri' | 'bumdes' | 'pertanian-perkebunan' | 'sda-lingkungan';
  title: string;
  subtitle: string;
  narrative: string;
  imageUrls: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type ImportantNumberContact = {
  id: string;
  label: string;
  number: string;
  category: 'pemerintah' | 'keamanan' | 'kesehatan' | 'wilayah';
};

export type ImportantNumbersData = {
  contacts: ImportantNumberContact[];
  servicePhoneNumber?: string;
  updatedAt?: any;
};


