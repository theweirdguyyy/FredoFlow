import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { AppError } from './errorHandler.js';

// --- Avatar Storage Configuration ---
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fredoflow/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const avatarFileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, GIF, WebP) are allowed', 400, 'INVALID_FILE_TYPE'), false);
  }
};

// --- Attachment Storage Configuration ---
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fredoflow/attachments',
    resource_type: 'auto', // Allows non-image files like PDFs
  },
});

// --- Exported Middlewares ---

/**
 * Middleware for single avatar image upload.
 * Max size: 5MB
 */
export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Middleware for generic attachments (images, pdfs, docs).
 * Max size: 10MB
 */
export const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
