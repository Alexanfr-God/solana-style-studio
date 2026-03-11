// supabase/functions/mint-nft-solana/index.ts
import { Buffer } from 'node:buffer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function parseSecretKey(raw: string): Promise<Uint8Array> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Uint8Array(parsed);
  } catch {
    // fall through to base58
  }

  try {
    const bs58Mod = await import('npm:bs58@6.0.0');
    const bs58 = bs58Mod.default || bs58Mod;
    return bs58.decode(raw);
  } catch {
    throw new Error('SOLANA_DEVNET_KEYPAIR must be valid JSON array or Base58');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      metadataUri,
      recipient,
      name = 'WCC Theme',
      symbol = 'WCC',
    } = body as {
      metadataUri?: string;
      recipient?: string;
      name?: string;
      symbol?: string;
    };

    if (!metadataUri || !recipient) {
      return jsonResponse(400, {
        success: false,
        message: 'Missing required fields: metadataUri and recipient',
      });
    }

    const keyRaw = Deno.env.get('SOLANA_DEVNET_KEYPAIR');
    if (!keyRaw) {
      return jsonResponse(500, {
        success: false,
        message: 'Server wallet not configured. Please add SOLANA_DEVNET_KEYPAIR secret.',
      });
    }

    const {
      Connection,
      Keypair,
      PublicKey,
      Transaction,
      SystemProgram,
      sendAndConfirmTransaction,
      LAMPORTS_PER_SOL,
    } = await import('npm:@solana/web3.js@1.98.2');

    const {
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
      createInitializeMintInstruction,
      createAssociatedTokenAccountInstruction,
      createMintToInstruction,
      createTransferInstruction,
      getAssociatedTokenAddress,
      getMinimumBalanceForRentExemptMint,
      MINT_SIZE,
    } = await import('npm:@solana/spl-token@0.3.11');

    const mplModule = await import('npm:@metaplex-foundation/mpl-token-metadata@^2.0.0');
    const createCreateMetadataAccountV3Instruction = mplModule.createCreateMetadataAccountV3Instruction;
    const MPL_TOKEN_METADATA_PROGRAM_ID = mplModule.PROGRAM_ID;

    const endpoint = Deno.env.get('HELIUS_DEVNET') || 'https://api.devnet.solana.com';
    const connection = new Connection(endpoint, 'confirmed');

    const payerSecret = await parseSecretKey(keyRaw.trim());
    const payer = Keypair.fromSecretKey(payerSecret);
    const recipientPubkey = new PublicKey(recipient);

    const balance = await connection.getBalance(payer.publicKey);
    if (balance < 0.02 * LAMPORTS_PER_SOL) {
      return jsonResponse(400, {
        success: false,
        message: 'Insufficient server wallet balance on devnet (need at least 0.02 SOL).',
      });
    }

    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    const payerAta = await getAssociatedTokenAddress(
      mintAddress,
      payer.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const recipientAta = await getAssociatedTokenAddress(
      mintAddress,
      recipientPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const tx = new Transaction();

    tx.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintAddress,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      }),
    );

    tx.add(createInitializeMintInstruction(mintAddress, 0, payer.publicKey, payer.publicKey, TOKEN_PROGRAM_ID));

    tx.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        payerAta,
        payer.publicKey,
        mintAddress,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );

    tx.add(createMintToInstruction(mintAddress, payerAta, payer.publicKey, 1, [], TOKEN_PROGRAM_ID));

    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
      MPL_TOKEN_METADATA_PROGRAM_ID,
    );

    tx.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAddress,
          mint: mintAddress,
          mintAuthority: payer.publicKey,
          payer: payer.publicKey,
          updateAuthority: payer.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name,
              symbol,
              uri: metadataUri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: false,
            collectionDetails: null,
          },
        },
      ),
    );

    const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
    if (!recipientAtaInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          recipientAta,
          recipientPubkey,
          mintAddress,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }

    tx.add(createTransferInstruction(payerAta, recipientAta, payer.publicKey, 1, [], TOKEN_PROGRAM_ID));

    const signature = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair], { commitment: 'confirmed' });

    return jsonResponse(200, {
      success: true,
      mintAddress: mintAddress.toBase58(),
      signature,
      transferSignature: signature,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress.toBase58()}?cluster=devnet`,
      transferredTo: recipient,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[mint-nft-solana] ❌ Error:', errorMessage);

    return jsonResponse(500, {
      success: false,
      message: 'Mint failed',
      detail: errorMessage,
    });
  }
});
