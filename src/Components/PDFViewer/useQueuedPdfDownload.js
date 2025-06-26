import { useState } from 'react';
import { message } from 'antd';
import axiosInstance from '../axiosInstance';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export function useQueuedPdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState('');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('');

  // Submit the job and get a jobId
  const submitQueuedPdfJob = async ({ documentId, canvas }) => {
    if (!documentId) {
      message.error('Document ID is missing.');
      return;
    }
    setIsDownloading(true);
    setProgress('Starting PDF annotation job...');
    try {
      // For speed, use lower-res PNG (no multiplier)
      // If you only need vector annotation data, you can skip the PNG upload entirely
      const canvasDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        // multiplier: 4, // Commented out for speed
      });
      const formData = new FormData();
      formData.append('pageImage', canvasDataUrl);
      const applyRes = await axiosInstance.post(
        `/annotations/document/${documentId}/apply`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const jobId = applyRes.data.jobId;
      if (!jobId) throw new Error('No jobId returned from server');
      setJobId(jobId);
      setProgress(
        'PDF annotation job started. You can check status or download when ready.'
      );
      message.info(
        'PDF annotation job started. You can check status or download when ready.'
      );
    } catch (error) {
      setProgress(
        'Failed to start PDF annotation job: ' + (error.message || error)
      );
      message.error(
        'Failed to start PDF annotation job: ' + (error.message || error)
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Check job status
  const checkJobStatus = async () => {
    if (!jobId) {
      message.error('No job in progress.');
      return;
    }
    try {
      const statusRes = await axiosInstance.get(
        `/annotations/job/${jobId}/status`
      );
      setJobStatus(statusRes.data.status);
      setProgress(`Job status: ${statusRes.data.status}`);
      if (statusRes.data.status === 'completed') {
        message.success('PDF annotation job completed. You can now download.');
      } else if (statusRes.data.status === 'failed') {
        message.error('PDF annotation job failed.');
      }
    } catch (error) {
      setProgress('Failed to check job status: ' + (error.message || error));
      message.error('Failed to check job status: ' + (error.message || error));
    }
  };

  // Download the annotated PDF and comments as zip
  const downloadQueuedPdf = async ({ documentId }) => {
    if (!jobId) {
      message.error('No completed job to download.');
      return;
    }
    setIsDownloading(true);
    setProgress('Downloading annotated PDF...');
    try {
      // 1. Download the annotated PDF
      const pdfRes = await axiosInstance.get(
        `/annotations/job/${jobId}/download`,
        {
          responseType: 'blob',
        }
      );
      const annotatedPdfBlob = new Blob([pdfRes.data], {
        type: 'application/pdf',
      });

      // 2. Fetch comments for the document
      let comments = [];
      const commentsRes = await axiosInstance.get(`/document/${documentId}`);
      const docData = commentsRes?.data?.document;
      if (docData && Array.isArray(docData.comments)) {
        comments = docData.comments;
      }

      // 3. Generate a PDF from comments using jsPDF
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Document Comments', 10, 15);
      let y = 25;
      if (comments.length === 0) {
        doc.setFontSize(12);
        doc.text('No comments available.', 10, y);
      } else {
        comments.forEach((comment, idx) => {
          if (!comment.isPrivate) {
            const user = comment.user?.name || 'Unknown User';
            const date = comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : '';
            const body = comment.body || '';
            doc.setFontSize(12);
            doc.text(`${idx + 1}. ${user} (${date})`, 10, y);
            y += 7;
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(body, 180);
            doc.text(lines, 15, y);
            y += lines.length * 6 + 4;
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
          }
        });
      }
      const commentsPdfBlob = doc.output('blob');

      // 4. Zip the annotated PDF and comments PDF using JSZip
      const zip = new JSZip();
      zip.file(`annotated-${documentId}.pdf`, annotatedPdfBlob);
      zip.file(`comments-${documentId}.pdf`, commentsPdfBlob);
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 5. Trigger download of the zip
      saveAs(
        zipBlob,
        `${docData.file?.fileName || documentId}-with-comments.zip`
      );
      setProgress('Annotated PDF and comments downloaded as zip successfully');
      message.success(
        'Annotated PDF and comments downloaded as zip successfully'
      );
    } catch (error) {
      setProgress(
        'Failed to download annotated PDF and comments as zip: ' +
          (error.message || error)
      );
      message.error(
        'Failed to download annotated PDF and comments as zip: ' +
          (error.message || error)
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    submitQueuedPdfJob,
    checkJobStatus,
    downloadQueuedPdf,
    isDownloading,
    progress,
    jobStatus,
  };
}
