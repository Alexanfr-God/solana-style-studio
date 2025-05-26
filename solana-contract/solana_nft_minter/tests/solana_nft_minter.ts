import * as anchor from "@coral-xyz/anchor";
  import { Program } from "@coral-xyz/anchor";
  import { SolanaNftMinter } from "../target/types/solana_nft_minter";
  import { assert } from "chai";

  describe("solana_nft_minter", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.SolanaNftMinter as Program<SolanaNftMinter>;
    const provider = anchor.getProvider();
    const wallet = provider.wallet as anchor.Wallet;

    let mintCounterPda: anchor.web3.PublicKey;
    let mintCounterBump: number;

    before(async () => {
      [mintCounterPda, mintCounterBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint-counter")],
        program.programId
      );
    });

    it("Initializes the mint counter", async () => {
      const maxMints = 100;
      await program.methods
        .initialize(new anchor.BN(maxMints))
        .accounts({
          mint_counter: mintCounterPda,
          authority: wallet.publicKey,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const mintCounterAccount = await program.account.mintCounter.fetch(mintCounterPda);
      assert.equal(mintCounterAccount.currentMints.toNumber(), 0);
      assert.equal(mintCounterAccount.maxMints.toNumber(), maxMints);
      assert.equal(mintCounterAccount.authority.toBase58(), wallet.publicKey.toBase58());
    });

    it("Mints an NFT", async () => {
      const currentMints = (await program.account.mintCounter.fetch(mintCounterPda)).currentMints.toNumber();
      const [nftPda, _nftBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("nft"), new anchor.BN(currentMints).toBuffer("le", 8)],
        program.programId
      );

      const name = "My NFT";
      const uri = "https://example.com/nft.json";
      await program.methods
        .mintNft(name, uri)
        .accounts({
          nft: nftPda,
          mint_counter: mintCounterPda,
          authority: wallet.publicKey,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const nftAccount = await program.account.nft.fetch(nftPda);
      assert.equal(nftAccount.name, name);
      assert.equal(nftAccount.uri, uri);
      assert.equal(nftAccount.authority.toBase58(), wallet.publicKey.toBase58());

      const updatedMintCounter = await program.account.mintCounter.fetch(mintCounterPda);
      assert.equal(updatedMintCounter.currentMints.toNumber(), currentMints + 1);
    });

    it("Fails when max mints reached", async () => {
      const maxMints = 1;
      const [newMintCounterPda, newMintCounterBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint-counter-test")],
        program.programId
      );

      await program.methods
        .initialize(new anchor.BN(maxMints))
        .accounts({
          mint_counter: newMintCounterPda,
          authority: wallet.publicKey,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const [nftPda, _nftBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("nft"), new anchor.BN(0).toBuffer("le", 8)],
        program.programId
      );

      await program.methods
        .mintNft("First NFT", "https://example.com/first.json")
        .accounts({
          nft: nftPda,
          mint_counter: newMintCounterPda,
          authority: wallet.publicKey,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const [secondNftPda, _secondNftBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("nft"), new anchor.BN(1).toBuffer("le", 8)],
        program.programId
      );

      try {
        await program.methods
          .mintNft("Second NFT", "https://example.com/second.json")
          .accounts({
            nft: secondNftPda,
            mint_counter: newMintCounterPda,
            authority: wallet.publicKey,
            system_program: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        assert.fail("Should have failed due to max mints reached");
      } catch (error) {
        assert.equal(error.error.errorCode.code, "MaxMintsReached");
      }
    });
  });