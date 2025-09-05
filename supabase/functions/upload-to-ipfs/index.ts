import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pinataApiKey = Deno.env.get('PINATA_API_KEY');
    if (!pinataApiKey) {
      throw new Error('PINATA_API_KEY is not set');
    }

    const { metadata, imageBase64 } = await req.json();
    
    if (!metadata || !imageBase64) {
      throw new Error('Metadata and imageBase64 are required');
    }

    console.log('Uploading to IPFS:', { 
      title: metadata.title,
      hasImage: !!imageBase64 
    });

    // First, upload the image to IPFS
    const imageFormData = new FormData();
    
    // Convert base64 to Blob
    const imageBlob = new Blob([
      Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))
    ], { type: 'image/jpeg' });
    
    imageFormData.append('file', imageBlob, `${metadata.title || 'nft'}.jpg`);
    imageFormData.append('pinataOptions', JSON.stringify({
      cidVersion: 1
    }));
    imageFormData.append('pinataMetadata', JSON.stringify({
      name: `${metadata.title || 'NFT'} Image`,
      keyvalues: {
        type: 'nft-image'
      }
    }));

    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataApiKey}`,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Pinata image upload error:', errorText);
      throw new Error(`Failed to upload image to IPFS: ${errorText}`);
    }

    const imageResult = await imageResponse.json();
    const imageIpfsUrl = `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`;
    
    console.log('Image uploaded to IPFS:', imageIpfsUrl);

    // Now upload the metadata with the image URL
    const nftMetadata = {
      name: metadata.title,
      description: metadata.description,
      image: imageIpfsUrl,
      attributes: metadata.attributes || [],
      external_url: metadata.external_url || '',
      created_at: new Date().toISOString(),
      creator: metadata.creator || '',
      royalty_percentage: metadata.royalty_percentage || 0
    };

    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataApiKey}`,
      },
      body: JSON.stringify({
        pinataContent: nftMetadata,
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: `${metadata.title || 'NFT'} Metadata`,
          keyvalues: {
            type: 'nft-metadata',
            title: metadata.title || 'Untitled'
          }
        }
      }),
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Pinata metadata upload error:', errorText);
      throw new Error(`Failed to upload metadata to IPFS: ${errorText}`);
    }

    const metadataResult = await metadataResponse.json();
    const metadataIpfsUrl = `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;

    console.log('Metadata uploaded to IPFS:', metadataIpfsUrl);

    return new Response(JSON.stringify({
      success: true,
      imageIpfsHash: imageResult.IpfsHash,
      imageIpfsUrl,
      metadataIpfsHash: metadataResult.IpfsHash,
      metadataIpfsUrl,
      metadata: nftMetadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-to-ipfs function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});