import { supabase } from '@/integrations/supabase/client';

export interface NFTMetadata {
  title: string;
  description: string;
  creator?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  royalty_percentage?: number;
}

export interface IPFSUploadResult {
  success: boolean;
  imageIpfsHash?: string;
  imageIpfsUrl?: string;
  metadataIpfsHash?: string;
  metadataIpfsUrl?: string;
  metadata?: any;
  error?: string;
}

/**
 * Upload NFT image and metadata to IPFS via Pinata
 */
export const uploadToIPFS = async (
  metadata: NFTMetadata,
  imageFile: File
): Promise<IPFSUploadResult> => {
  try {
    // Convert image file to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    // Remove data URL prefix
    const base64Data = imageBase64.split(',')[1];

    const { data, error } = await supabase.functions.invoke('upload-to-ipfs', {
      body: {
        metadata,
        imageBase64: base64Data
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('IPFS upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Get IPFS URL from hash
 */
export const getIPFSUrl = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

/**
 * Validate image file type and size
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Geçersiz dosya formatı. JPG, PNG, GIF veya WebP desteklenmektedir.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.'
    };
  }

  return { valid: true };
};