import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  setWalletTransaction,
  signAndSendTransaction,
  WalletAdapter,
} from "./wallet";

export async function getChatMessageAccountPubkey(
  connection: Connection,
  wallet: WalletAdapter,
  programId: PublicKey,
  space: number
): Promise<PublicKey> {
  if (!wallet.publicKey) {
    throw Error("Wallet has no PublicKey");
  }
  let chatAccountPubkey: PublicKey | null = null;
  const existingPubkeyStr = localStorage.getItem(
    wallet.publicKey.toBase58() ?? ""
  );
  if (existingPubkeyStr) {
    chatAccountPubkey = new PublicKey(existingPubkeyStr);
    console.log("chat account found");
    return chatAccountPubkey;
  }

  const CHAT_SEED = "chat";
  chatAccountPubkey = await PublicKey.createWithSeed(
    wallet.publicKey,
    CHAT_SEED,
    programId
  );
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const instruction = SystemProgram.createAccountWithSeed({
    fromPubkey: wallet.publicKey,
    basePubkey: wallet.publicKey,
    seed: CHAT_SEED,
    newAccountPubkey: chatAccountPubkey,
    lamports,
    space,
    programId,
  });
  let trans = await setWalletTransaction(wallet, instruction);
  let signature = await signAndSendTransaction(wallet, trans);
  let result = await connection.confirmTransaction(signature, "singleGossip");
  console.log("new chat account created", result);

  return chatAccountPubkey;
}
