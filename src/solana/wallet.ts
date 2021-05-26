// @ts-ignore
import Wallet from "@project-serum/sol-wallet-adapter";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import EventEmitter from "eventemitter3";

export interface WalletAdapter extends EventEmitter {
  publicKey: PublicKey | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  connect: () => any;
  disconnect: () => any;
}

const cluster = "http://localhost:8899";
const connection = new Connection(cluster, "confirmed");
const wallet: WalletAdapter = new Wallet("https://www.sollet.io", cluster);

export async function initWallet(): Promise<[Connection, WalletAdapter]> {
  await wallet.connect();
  return [connection, wallet];
}

export async function sendMoney(
  destPubkeyStr: string,
  lamports: number = 500 * 1000000 // about half a SOL
) {
  try {
    console.log("start sendMoney");
    const destPubkey = new PublicKey(destPubkeyStr);
    const walletAccountInfo = await connection.getAccountInfo(
      wallet!.publicKey!
    );
    console.log("wallet data size", walletAccountInfo?.data.length);

    const receiverAccountInfo = await connection.getAccountInfo(destPubkey);
    console.log("receiver data size", receiverAccountInfo?.data.length);

    const instruction = SystemProgram.transfer({
      fromPubkey: wallet!.publicKey!,
      toPubkey: destPubkey,
      lamports,
    });
    let trans = await setPayerAndBlockhashTransaction(wallet, instruction);

    let signature = await signAndSendTransaction(wallet, trans);
    let result = await connection.confirmTransaction(signature, "singleGossip");
    console.log("end sendMoney", result);
  } catch (e) {
    console.warn("Failed", e);
  }
}

export async function setPayerAndBlockhashTransaction(
  wallet: WalletAdapter,
  instruction: TransactionInstruction
): Promise<Transaction> {
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.feePayer = wallet!.publicKey!;
  let hash = await connection.getRecentBlockhash();
  transaction.recentBlockhash = hash.blockhash;
  return transaction;
}

export async function signAndSendTransaction(
  wallet: WalletAdapter,
  transaction: Transaction
): Promise<string> {
  try {
    console.log("start signAndSendTransaction");
    let signedTrans = await wallet.signTransaction(transaction);
    console.log("signed transaction");
    let signature = await connection.sendRawTransaction(
      signedTrans.serialize()
    );
    console.log("end signAndSendTransaction");
    return signature;
  } catch (err) {
    console.log("signAndSendTransaction error", err);
    throw err;
  }
}
