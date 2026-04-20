const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads');
const projectDocsDir = path.join(uploadDir, 'projects');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(projectDocsDir)) {
  fs.mkdirSync(projectDocsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.id;
    console.log(`[Upload] Receiving file for project ${projectId}: ${file.originalname}`);
    const projectPath = path.join(projectDocsDir, projectId);
    
    if (!fs.existsSync(projectPath)) {
      console.log(`[Upload] Creating directory: ${projectPath}`);
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    cb(null, projectPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fname = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`[Upload] Saving as: ${fname}`);
    cb(null, fname);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = {
  uploadProjectDocument: upload.single('file'),
};
