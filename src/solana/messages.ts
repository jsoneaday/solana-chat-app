import { WalletAdapter } from "./wallet";
import borsh from "borsh";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { getChatMessageAccountPubkey } from "./accounts";
import { programId } from "./program";

class ChatMessage {
  archive_id: string = "0000000000000000000000000000000000000000000";
  created_on: string = "0000000000000000"; // max milliseconds in date
  constructor(
    fields: { archive_id: string; created_on: string } | undefined = undefined
  ) {
    if (fields) {
      this.archive_id = fields.archive_id;
      this.created_on = fields.created_on;
    }
  }
}

const ChatMessageSchema = new Map([
  [
    ChatMessage,
    {
      kind: "struct",
      fields: [
        ["archive_id", "String"],
        ["created_on", "String"],
      ],
    },
  ],
]);

const sampleChatMessage = new ChatMessage();
const CHAT_MESSAGE_SIZE = borsh.serialize(
  ChatMessageSchema,
  sampleChatMessage
).length;

export async function getMessageSentHistory(
  connection: Connection,
  sentPubkeyStr: string
): Promise<Array<ChatMessage>> {
  const sentPubkey = new PublicKey(sentPubkeyStr);
  const sentAccount = await connection.getAccountInfo(sentPubkey);
  // get and deserialize solana account data and receive txid
  // go to arweave and query using these txid
  // parse json and return ChatMessages
  const messages: Array<ChatMessage> = [];
  return messages;
}

export async function getMessageReceivedHistory(
  connection: Connection,
  wallet: WalletAdapter
): Promise<Array<ChatMessage>> {
  const walletAccount = await getChatMessageAccountPubkey(
    connection,
    wallet,
    CHAT_MESSAGE_SIZE
  );
  const messages: Array<ChatMessage> = [];
  return messages;
}

export async function sendMessage(
  connection: Connection,
  wallet: WalletAdapter,
  destPubkeyStr: string,
  msg: string
): Promise<void> {
  const destPubkey = new PublicKey(destPubkeyStr);
  const walletChatAccountPubkey = await getChatMessageAccountPubkey(
    connection,
    wallet,
    CHAT_MESSAGE_SIZE
  );
}
