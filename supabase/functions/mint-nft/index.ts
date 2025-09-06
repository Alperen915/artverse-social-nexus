import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MintRequest {
  submissionId: string;
  contractAddress: string;
  recipientAddress: string;
  metadataUri: string;
  transactionHash: string;
  tokenId: string;
  gasUsed?: string;
  gasPrice?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      submissionId,
      contractAddress,
      recipientAddress,
      metadataUri,
      transactionHash,
      tokenId,
      gasUsed,
      gasPrice
    }: MintRequest = await req.json();

    console.log('Processing NFT mint:', {
      submissionId,
      contractAddress,
      recipientAddress,
      transactionHash,
      tokenId
    });

    // Create NFT mint record
    const { data: mintData, error: mintError } = await supabase
      .from('nft_mints')
      .insert({
        submission_id: submissionId,
        minter_address: recipientAddress,
        contract_address: contractAddress,
        token_id: tokenId,
        transaction_hash: transactionHash,
        metadata_uri: metadataUri,
        gas_used: gasUsed ? BigInt(gasUsed) : null,
        gas_price: gasPrice ? BigInt(gasPrice) : null,
        status: 'confirmed'
      })
      .select()
      .single();

    if (mintError) {
      console.error('Error creating mint record:', mintError);
      throw new Error(`Failed to create mint record: ${mintError.message}`);
    }

    // Update gallery submission with NFT details
    const { error: updateError } = await supabase
      .from('gallery_submissions')
      .update({
        nft_contract: contractAddress,
        nft_token_id: tokenId
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      throw new Error(`Failed to update submission: ${updateError.message}`);
    }

    // Create blockchain transaction record
    const { error: txError } = await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: transactionHash,
        from_address: recipientAddress,
        to_address: contractAddress,
        status: 'confirmed',
        transaction_type: 'nft_mint',
        gas_used: gasUsed ? BigInt(gasUsed) : null,
        gas_price: gasPrice ? BigInt(gasPrice) : null,
        metadata: {
          submission_id: submissionId,
          token_id: tokenId,
          contract_address: contractAddress
        }
      });

    if (txError) {
      console.error('Error creating transaction record:', txError);
      // Don't throw here as the mint was successful
    }

    // Create marketplace listing
    const { data: submission } = await supabase
      .from('gallery_submissions')
      .select('price')
      .eq('id', submissionId)
      .single();

    if (submission?.price) {
      const { error: listingError } = await supabase
        .from('public_nft_marketplace')
        .insert({
          submission_id: submissionId,
          mint_id: mintData.id,
          price: submission.price,
          seller_address: recipientAddress,
          status: 'active'
        });

      if (listingError) {
        console.error('Error creating marketplace listing:', listingError);
      }
    }

    console.log('NFT mint processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        mintId: mintData.id,
        transactionHash,
        tokenId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in mint-nft function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});