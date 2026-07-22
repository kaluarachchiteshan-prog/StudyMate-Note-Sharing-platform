import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export async function uploadNoteFile(file: File, courseCode: string): Promise<{ url: string; fileName: string; fileSize: string }> {
  const fileName = file.name || `${courseCode}_Note.pdf`;
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const fileSize = `${fileSizeMB} MB`;

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `notes/${Date.now()}_${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, fileName, fileSize };
    } catch (e) {
      console.warn('Firebase storage upload fallback to local URL', e);
    }
  }

  // Instant Blob / Dummy URL fallback for preview
  const url = URL.createObjectURL(file) || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  return { url, fileName, fileSize };
}
