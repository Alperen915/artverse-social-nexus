import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaucetRequest {
  address: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { address }: FaucetRequest = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Faucet claim request for address: ${address}`);

    // Check if user has claimed in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentClaim, error: checkError } = await supabase
      .from('faucet_claims')
      .select('id, claimed_at')
      .eq('wallet_address', address)
      .gte('claimed_at', oneDayAgo)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking recent claims:', checkError);
      throw checkError;
    }

    if (recentClaim) {
      const nextClaimTime = new Date(new Date(recentClaim.claimed_at).getTime() + 24 * 60 * 60 * 1000);
      return new Response(
        JSON.stringify({ 
          error: 'Already claimed today',
          nextClaimTime: nextClaimTime.toISOString(),
          message: `You can claim again in ${Math.ceil((nextClaimTime.getTime() - Date.now()) / (1000 * 60 * 60))} hours`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Amount to distribute (100 BROS)
    const FAUCET_AMOUNT = '100';
    const CHAIN_ID = '0xD9560'; // Bros Chain Testnet

    // TODO: Implement actual token transfer using ethers.js
    // For now, we'll simulate the transfer and return a mock tx hash
    // In production, this should:
    // 1. Connect to Bros Chain RPC
    // 2. Use faucet wallet private key from environment
    // 3. Transfer BROS tokens to the user's address
    // 4. Wait for transaction confirmation
    
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    console.log(`Mock transfer of ${FAUCET_AMOUNT} BROS to ${address}`);
    console.log(`Mock transaction hash: ${mockTxHash}`);

    // Record the claim in database
    const { error: insertError } = await supabase
      .from('faucet_claims')
      .insert({
        wallet_address: address,
        amount: FAUCET_AMOUNT,
        chain_id: CHAIN_ID,
        tx_hash: mockTxHash,
        claimed_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording claim:', insertError);
      throw insertError;
    }

    console.log(`Faucet claim successful for ${address}`);

    return new Response(
      JSON.stringify({ 
        txHash: mockTxHash,
        amount: FAUCET_AMOUNT,
        message: `Successfully claimed ${FAUCET_AMOUNT} BROS tokens!`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Faucet error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while claiming from faucet' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
