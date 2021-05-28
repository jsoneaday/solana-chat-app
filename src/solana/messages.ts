import {
  setPayerAndBlockhashTransaction,
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
import { programId } from "./program";

const CHAT_MESSAGE_ELEMENTS_COUNT = 20;
export const DUMMY_TX_ID = "0000000000000000000000000000000000000000000";
export const DUMMY_CREATED_ON = "0000000000000000";
export class ChatMessage {
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
      length += serialize(ChatMessageSchema, sampleChatMessages[i]).length;
    }
    this.CHAT_MESSAGES_SIZE = length + 4; // plus 4 due to some data diffs between client and program
  }

  constructor() {
    this.setChatMessagesDataSize();
  }

  private getDefaultChatMessages(): Array<ChatMessage> {
    const chatMessages: Array<ChatMessage> = [];
    for (let i = 0; i < CHAT_MESSAGE_ELEMENTS_COUNT; i++) {
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
    const archive_id = lo.cstr("archive_id");
    const created_on = lo.cstr("created_on");
    const dataStruct = lo.struct(
      [archive_id, lo.seq(lo.u8(), 2), created_on, lo.seq(lo.u8(), 2)],
      "ChatMessage"
    );
    const ds = lo.seq(dataStruct, CHAT_MESSAGE_ELEMENTS_COUNT);
    const messages = ds.decode(sentAccount.data);
    return messages;
  }

  async getMessageSentHistory(
    connection: Connection,
    sentChatPubkeyStr: string
  ): Promise<Array<ChatMessage>> {
    const messages = await this.getAccountMessageHistory(
      connection,
      sentChatPubkeyStr
    );
    console.log("getMessageSentHistory", messages);
    return messages;
  }

  async getMessageReceivedHistory(
    connection: Connection,
    walletChatPubkeyStr: string
  ): Promise<Array<ChatMessage>> {
    const messages = await this.getAccountMessageHistory(
      connection,
      walletChatPubkeyStr
    );
    console.log("getMessageReceivedHistory", messages);
    return messages;
  }

  async sendMessage(
    connection: Connection,
    wallet: WalletAdapter,
    destPubkeyStr: string,
    txid: string
  ): Promise<RpcResponseAndContext<SignatureResult>> {
    console.log("start sendMessage");
    const destPubkey = new PublicKey(destPubkeyStr);

    const messageObj = new ChatMessage();
    messageObj.archive_id = this.getTxIdFromArweave(txid);
    messageObj.created_on = this.getCreatedOn();
    const messageInstruction = new TransactionInstruction({
      keys: [{ pubkey: destPubkey, isSigner: false, isWritable: true }],
      programId,
      data: Buffer.from(serialize(ChatMessageSchema, messageObj)),
    });
    const trans = await setPayerAndBlockhashTransaction(
      wallet,
      messageInstruction
    );
    const signature = await signAndSendTransaction(wallet, trans);
    const result = await connection.confirmTransaction(
      signature,
      "singleGossip"
    );
    console.log("end sendMessage", result);
    return result;
  }

  private getTxIdFromArweave(newTxId: string): string {
    // save message to arweave and get back txid;
    let txid = "";
    const dummyLength = DUMMY_TX_ID.length - newTxId.length;
    for (let i = 0; i < dummyLength; i++) {
      txid += "0";
    }
    txid += newTxId;
    console.log("getTxIdFromArweave", txid);
    return txid;
  }

  // get value and add dummy values
  private getCreatedOn(): string {
    const now = Date.now().toString();
    console.log("now", now);
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
