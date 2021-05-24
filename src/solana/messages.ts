import {
  setWalletTransaction,
  signAndSendTransaction,
  WalletAdapter,
} from "./wallet";
import { serialize } from "borsh";
// @ts-ignore
import lo from "buffer-layout";
import {
  Connection,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  TransactionInstruction,
} from "@solana/web3.js";
import { getChatMessageAccountPubkey } from "./accounts";
import { programId } from "./program";

const CHAT_MESSAGE_ELEMENTS = 20;
const DUMMY_TX_ID = "0000000000000000000000000000000000000000000";
const DUMMY_CREATED_ON = "0000000000000000";
class ChatMessage {
  archive_id: string = DUMMY_TX_ID;
  created_on: string = DUMMY_CREATED_ON; // max milliseconds in date
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

class MessageService {
  CHAT_MESSAGES_SIZE: number = 0;
  setChatMessagesDataSize() {
    const sampleChatMessages: Array<ChatMessage> =
      this.getDefaultChatMessages();

    let length = 0;
    for (let i = 0; i < sampleChatMessages.length; i++) {
      length += serialize(ChatMessageSchema, sampleChatMessages[0]).length;
    }
    this.CHAT_MESSAGES_SIZE = length;
  }

  constructor() {
    this.setChatMessagesDataSize();
  }

  private getDefaultChatMessages(): Array<ChatMessage> {
    const chatMessages: Array<ChatMessage> = [];
    for (let i = 0; i < CHAT_MESSAGE_ELEMENTS; i++) {
      chatMessages.push(new ChatMessage());
    }

    return chatMessages;
  }

  async getAccountMessageHistory(
    connection: Connection,
    pubKeyStr: string
  ): Promise<Array<ChatMessage>> {
    const sentPubkey = new PublicKey(pubKeyStr);
    const sentAccount = await connection.getAccountInfo(sentPubkey);
    // get and deserialize solana account data and receive txid
    // go to arweave and query using these txid
    // parse json and return ChatMessages
    if (!sentAccount) {
      throw Error(`Account ${pubKeyStr} does not exist`);
    }
    const archive_id = lo.seq(lo.cstr(), 43, "archive_id");
    const created_on = lo.seq(lo.cstr(), 16, "created_on");
    const dataStruct = lo.struct([archive_id, created_on], "ChatMessage");
    const ds = lo.seq(dataStruct, sentAccount.data.length);
    const messages = ds.decode(sentAccount.data);
    return messages;
  }

  async getMessageSentHistory(
    connection: Connection,
    sentPubkeyStr: string
  ): Promise<Array<ChatMessage>> {
    const messages = await this.getAccountMessageHistory(
      connection,
      sentPubkeyStr
    );
    return messages;
  }

  async getMessageReceivedHistory(
    connection: Connection,
    wallet: WalletAdapter
  ): Promise<Array<ChatMessage>> {
    console.log("start getMessageReceivedHistory");
    const walletChatAccountPubkey = await getChatMessageAccountPubkey(
      connection,
      wallet,
      messageService.CHAT_MESSAGES_SIZE
    );
    const messages = await this.getAccountMessageHistory(
      connection,
      walletChatAccountPubkey.toBase58()
    );
    console.log("end getMessageReceivedHistory");
    return messages;
  }

  async sendMessage(
    connection: Connection,
    wallet: WalletAdapter,
    destPubkeyStr: string,
    msg: string
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    console.log("start sendMessage");
    const destPubkey = new PublicKey(destPubkeyStr);

    const messageObj = new ChatMessage();
    messageObj.archive_id = this.getTxIdFromArweave(msg);
    messageObj.created_on = this.getCreatedOn();
    const messageInstruction = new TransactionInstruction({
      keys: [{ pubkey: destPubkey, isSigner: false, isWritable: true }],
      programId,
      data: Buffer.from(serialize(ChatMessageSchema, messageObj)),
    });
    const trans = await setWalletTransaction(wallet, messageInstruction);
    const signature = await signAndSendTransaction(wallet, trans);
    const result = await connection.confirmTransaction(
      signature,
      "singleGossip"
    );
    console.log("end sendMessage", result);
    return result;
  }

  private getTxIdFromArweave(msg: string): string {
    // save message to arweave and get back txid;
    const txid = DUMMY_TX_ID;
    return txid;
  }

  // get value and add dummy values
  private getCreatedOn(): string {
    const now = new Date().getUTCMilliseconds().toString();
    const total = DUMMY_CREATED_ON.length;
    const diff = total - now.length;
    let prefix = "";
    for (let i = 0; i < diff; i++) {
      prefix += "0";
    }
    const created_on = prefix + now;
    console.log("created_on", created_on);
    return created_on;
  }
}

const messageService = new MessageService();
export default messageService;
