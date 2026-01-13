import WordViewer from './WordViewer';
import ExcelViewer from './ExcelViewer';

// File type detection utility
export const getFileType = (fileName) => {
  if (!fileName) return 'unknown';
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return 'image';
    default:
      return 'unknown';
  }
};

// Get file type from MIME type
export const getFileTypeFromMime = (mimeType) => {
  if (!mimeType) return 'unknown';
  
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'word';
  }
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'excel';
  }
  
  return 'unknown';
};

export { WordViewer, ExcelViewer };
