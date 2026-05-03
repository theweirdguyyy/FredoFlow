import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

 
const memStorage = multer.memoryStorage();

// ── Generic file size limits 
export const avatarUpload = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  },
}).single('avatar');

export const attachmentUpload = multer({
  storage: memStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).single('file');

// ── Helper: upload a buffer to Cloudinary 
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'fredoflow/uploads',
        resource_type: options.resource_type || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// ── Convenience: upload avatar buffer 
export const uploadAvatar = (buffer, publicId) =>
  uploadBufferToCloudinary(buffer, {
    folder: 'fredoflow/avatars',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

// ── Convenience: upload attachment buffer 
export const uploadAttachment = (buffer, filename) =>
  uploadBufferToCloudinary(buffer, {
    folder: 'fredoflow/attachments',
    public_id: `${Date.now()}-${filename}`,
    resource_type: 'auto',
  });