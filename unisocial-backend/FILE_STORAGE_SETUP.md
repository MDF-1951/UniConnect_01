# File Storage Configuration

## Overview
UniSocial uses local file storage to save uploaded images and videos. Files are stored on your system and served through the backend API.

## Configuration

### Upload Directory
The upload directory is configured in `application.properties`:

```properties
file.upload-dir=C:/Users/Mohammed Fahim/Documents/Tech/UniConnect/uploads
```

**To change the upload location:**
1. Open `unisocial-backend/src/main/resources/application.properties`
2. Modify the `file.upload-dir` property to your desired path
3. Restart the backend server

### Supported File Types & Limits

**Images:**
- Supported formats: JPEG, PNG, GIF, WebP, etc.
- Max file size: 10MB

**Videos:**
- Supported formats: MP4, WebM, MOV, AVI, etc.
- Max file size: 50MB

**To change file size limits:**
Edit these properties in `application.properties`:
```properties
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

## How It Works

### Upload Flow:
1. User selects a file in the frontend
2. Frontend sends file to `/api/upload/media` endpoint
3. Backend saves file to the configured directory with a unique filename (UUID)
4. Backend returns the file URL (e.g., `/uploads/abc123.jpg`)
5. Frontend stores this URL in the post
6. When displaying posts, files are loaded from `http://localhost:8080/uploads/abc123.jpg`

### File Naming:
Files are saved with UUID-based names to:
- Prevent filename conflicts
- Ensure uniqueness
- Maintain security

Example: `original-photo.jpg` → `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`

## API Endpoints

### Upload Media (Image or Video)
```
POST /api/upload/media
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  file: <binary file data>

Response:
{
  "url": "/uploads/abc123.jpg",
  "type": "IMAGE"  // or "VIDEO"
}
```

### Upload Image Only
```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Upload Video Only
```
POST /api/upload/video
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Access Uploaded Files
```
GET /uploads/{filename}
No authentication required
```

## Directory Structure

```
UniConnect/
├── uploads/                              ← All uploaded files stored here
│   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
│   ├── b2c3d4e5-f6a7-8901-bcde-f12345678901.mp4
│   └── ...
├── unisocial-backend/
└── unisocial-frontend/
```

## Security Notes

1. **Authentication Required**: Upload endpoints require a valid JWT token
2. **Public Access**: Uploaded files are publicly accessible (anyone with the URL can view)
3. **File Validation**: Backend validates file types and sizes
4. **Unique Filenames**: UUID-based naming prevents guessing filenames

## Troubleshooting

### Files not uploading?
- Check if the upload directory exists and is writable
- Verify file size is within limits
- Check backend logs for errors

### Files not displaying?
- Ensure `REACT_APP_API_URL` is set correctly in frontend `.env.local`
- Check if backend is serving files from `/uploads/**` path
- Verify CORS settings allow file requests

### Change upload directory after deployment?
1. Update `file.upload-dir` in `application.properties`
2. Copy existing files to new location
3. Restart backend server

## Future Enhancements

For production, consider:
- **Cloud Storage**: AWS S3, Cloudinary, Firebase Storage
- **CDN**: Content Delivery Network for faster global access
- **Image Optimization**: Automatic compression and resizing
- **Backup**: Regular backups of uploaded files


