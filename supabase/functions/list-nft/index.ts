import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ListingRequest {
  submissionId: string;
  mintId: string;
  sellerAddress: string;
  price: number;
  transactionHash: string;
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
      mintId,
      sellerAddress,
      price,
      transactionHash,
      gasUsed,
      gasPrice
    }: ListingRequest = await req.json();

    console.log('Processing NFT listing:', {
      submissionId,
      mintId,
      sellerAddress,
      price,
      transactionHash
    });

    // Create or update marketplace listing
    const { data: listingData, error: listingError } = await supabase
      .from('public_nft_marketplace')
      .upsert({
        submission_id: submissionId,
        mint_id: mintId,
        price: price,
        seller_address: sellerAddress,
        status: 'active',
        transaction_hash: transactionHash
      }, {
        onConflict: 'submission_id'
      })
      .select()
      .single();

    if (listingError) {
      console.error('Error creating marketplace listing:', listingError);
      throw new Error(`Failed to create marketplace listing: ${listingError.message}`);
    }

    // Create NFT listing record
    const { error: nftListingError } = await supabase
      .from('nft_listings')
      .insert({
        mint_id: mintId,
        price: price,
        seller_address: sellerAddress,
        marketplace: 'Bros Chain Marketplace',
        listing_hash: transactionHash,
        transaction_hash: transactionHash,
        status: 'active'
      });

    if (nftListingError) {
      console.error('Error creating NFT listing:', nftListingError);
      // Don't throw here as the main listing was successful
    }

    // Create blockchain transaction record
    const { error: txError } = await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: transactionHash,
        from_address: sellerAddress,
        to_address: 'marketplace_contract', // or actual marketplace address
        status: 'confirmed',
        transaction_type: 'nft_listing',
        gas_used: gasUsed ? BigInt(gasUsed) : null,
        gas_price: gasPrice ? BigInt(gasPrice) : null,
        metadata: {
          submission_id: submissionId,
          mint_id: mintId,
          listing_price: price
        }
      });

    if (txError) {
      console.error('Error creating transaction record:', txError);
      // Don't throw here as the listing was successful
    }

    console.log('NFT listing processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        listingId: listingData.id,
        transactionHash,
        message: 'NFT listed successfully on marketplace'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in list-nft function:', error);
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