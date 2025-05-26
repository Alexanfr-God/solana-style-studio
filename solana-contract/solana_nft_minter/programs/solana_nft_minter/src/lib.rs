use anchor_lang::prelude::*;

declare_id!("58woYBJaJTsdLkGtQeAmSzFFLsjKh135fbCxyT8V4BL6");

#[program]
pub mod solana_nft_minter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, max_mints: u64) -> Result<()> {
        let mint_counter = &mut ctx.accounts.mint_counter;
        mint_counter.authority = *ctx.accounts.authority.key;
        mint_counter.current_mints = 0;
        mint_counter.max_mints = max_mints;
        msg!("Initialized mint counter with max_mints: {}", max_mints);
        Ok(())
    }

    pub fn mint_nft(ctx: Context<MintNFT>, name: String, uri: String) -> Result<()> {
        let mint_counter = &mut ctx.accounts.mint_counter;
        require!(
            mint_counter.current_mints < mint_counter.max_mints,
            MintError::MaxMintsReached
        );
        require!(name.len() <= 32, MintError::NameTooLong);
        require!(uri.len() <= 100, MintError::UriTooLong);

        let nft = &mut ctx.accounts.nft;
        nft.authority = *ctx.accounts.authority.key;
        nft.name = name;
        nft.uri = uri;

        mint_counter.current_mints += 1;
        msg!(
            "Minted NFT #{}: {} with URI: {}",
            mint_counter.current_mints,
            nft.name,
            nft.uri
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 8 + 32,
        seeds = [b"mint-counter"],
        bump
    )]
    pub mint_counter: Account<'info, MintCounter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 32) + (4 + 100),
        seeds = [b"nft", mint_counter.current_mints.to_le_bytes().as_ref()],
        bump
    )]
    pub nft: Account<'info, NFT>,
    #[account(
        mut,
        seeds = [b"mint-counter"],
        bump
    )]
    pub mint_counter: Account<'info, MintCounter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MintCounter {
    pub authority: Pubkey,
    pub current_mints: u64,
    pub max_mints: u64,
}

#[account]
pub struct NFT {
    pub authority: Pubkey,
    pub name: String,
    pub uri: String,
}

#[error_code]
pub enum MintError {
    #[msg("Maximum number of mints reached")]
    MaxMintsReached,
    #[msg("Name is too long, max 32 bytes")]
    NameTooLong,
    #[msg("URI is too long, max 100 bytes")]
    UriTooLong,
}