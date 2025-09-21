
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { Storage } from '@google-cloud/storage';
import pdf from 'pdf-parse';

const documentAiClient = new DocumentProcessorServiceClient();
const storageClient = new Storage();

export async function processDocument(
  fileBuffer: Buffer,
  mimeType: string,
  projectId: string,
  location: string,
  processorId: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    const data = await pdf(fileBuffer);
    return data.text;
  } else {
    const request = {
      name: `projects/${projectId}/locations/${location}/processors/${processorId}`,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };
    const [result] = await documentAiClient.processDocument(request);
    return result.document?.text ?? '';
  }
}
