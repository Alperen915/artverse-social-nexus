import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  mintId: string;
  submissionId: string;
  buyerAddress: string;
  sellerAddress: string;
  transactionHash: string;
  price: number;
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
      mintId,
      submissionId,
      buyerAddress,
      sellerAddress,
      transactionHash,
      price,
      gasUsed,
      gasPrice
    }: PurchaseRequest = await req.json();

    console.log('Processing NFT purchase:', {
      mintId,
      submissionId,
      buyerAddress,
      sellerAddress,
      transactionHash,
      price
    });

    // Create gallery sale record
    const { data: saleData, error: saleError } = await supabase
      .from('gallery_sales')
      .insert({
        submission_id: submissionId,
        sale_price: price,
        buyer_address: buyerAddress,
        transaction_hash: transactionHash
      })
      .select()
      .single();

    if (saleError) {
      console.error('Error creating sale record:', saleError);
      throw new Error(`Failed to create sale record: ${saleError.message}`);
    }

    // Update marketplace listing status
    const { error: marketplaceError } = await supabase
      .from('public_nft_marketplace')
      .update({
        status: 'sold',
        buyer_address: buyerAddress,
        sold_at: new Date().toISOString(),
        transaction_hash: transactionHash
      })
      .eq('submission_id', submissionId)
      .eq('status', 'active');

    if (marketplaceError) {
      console.error('Error updating marketplace listing:', marketplaceError);
    }

    // Update gallery submission as sold
    const { error: submissionError } = await supabase
      .from('gallery_submissions')
      .update({
        sold: true
      })
      .eq('id', submissionId);

    if (submissionError) {
      console.error('Error updating submission:', submissionError);
    }

    // Create blockchain transaction record
    const { error: txError } = await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: transactionHash,
        from_address: buyerAddress,
        to_address: sellerAddress,
        value: price,
        status: 'confirmed',
        transaction_type: 'nft_purchase',
        gas_used: gasUsed ? BigInt(gasUsed) : null,
        gas_price: gasPrice ? BigInt(gasPrice) : null,
        metadata: {
          submission_id: submissionId,
          mint_id: mintId,
          sale_price: price
        }
      });

    if (txError) {
      console.error('Error creating transaction record:', txError);
      // Don't throw here as the purchase was successful
    }

    // Distribute revenue to community members
    // Get the gallery and community info
    const { data: submissionData } = await supabase
      .from('gallery_submissions')
      .select(`
        gallery_id,
        nft_galleries!inner(
          community_id,
          title
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionData?.gallery_id) {
      // Calculate revenue distribution (simplified - equal split among community members)
      const platformFee = price * 0.025; // 2.5% platform fee
      const communityRevenue = price - platformFee;

      // Get community members
      const { data: members } = await supabase
        .from('community_memberships')
        .select('user_id')
        .eq('community_id', submissionData.nft_galleries.community_id);

      if (members && members.length > 0) {
        const revenuePerMember = communityRevenue / members.length;

        // Create revenue distribution records
        const distributionPromises = members.map(member => 
          supabase.from('revenue_distributions').insert({
            gallery_id: submissionData.gallery_id,
            member_id: member.user_id,
            amount: revenuePerMember,
            transaction_hash: transactionHash
          })
        );

        await Promise.all(distributionPromises);
        console.log(`Revenue distributed to ${members.length} community members`);
      }
    }

    console.log('NFT purchase processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        saleId: saleData.id,
        transactionHash,
        message: 'NFT purchase completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in purchase-nft function:', error);
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