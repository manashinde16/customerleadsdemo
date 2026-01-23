import axios from 'axios';
import { NITRO_BASE_URL } from '../config/env';

export interface FormField {
  type: 'text' | 'email' | 'number' | 'textarea';
  label: string;
  required: boolean;
}

export interface FormSchema {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'disabled';
  allowedDomains: string[];
  fields: FormField[];
}

export interface SubmissionPayload {
  [key: string]: string | number;
}

/**
 * Fetch form schema from Nitro API
 */
export async function fetchFormSchema(formId: string): Promise<FormSchema> {
  const response = await axios.get<FormSchema>(
    `${NITRO_BASE_URL}/api/forms/${formId}`
  );
  return response.data;
}

/**
 * Submit form data to Nitro API
 */
export async function submitForm(
  formId: string,
  data: SubmissionPayload
): Promise<void> {
  await axios.post(`${NITRO_BASE_URL}/api/forms/${formId}/submit`, data);
}
