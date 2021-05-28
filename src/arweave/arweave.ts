import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import TestWeave from "testweave-sdk";
import { ChatMessage } from "../solana/messages";

class ArweaveData {
  constructor(public message: string, public created_on: string) {}
}

class ArweaveService {
  arweave: Arweave;
  testWeave?: TestWeave;
  walletKey?: JWKInterface;

  constructor() {
    this.arweave = Arweave.init({
      host: "localhost",
      port: 1984,
      protocol: "http",
    });

    TestWeave.init(this.arweave).then((testWeave) => {
      this.testWeave = testWeave;
      this.walletKey = this.testWeave.rootJWK;
    });
  }

  async saveData(message: string): Promise<string> {
    console.log("start saveData");
    const transaction = await this.arweave.createTransaction(
      { data: message },
      this.walletKey!
    );
    transaction.addTag("Content-Type", "text/plain");
    await this.arweave.transactions.sign(transaction, this.walletKey!);
    await this.arweave.transactions.post(transaction);
    console.log("posted transaction");
    await this.testWeave!.mine(); // need this to force immediate mine of related block
    console.log("forced mine");
    const status = await this.arweave.transactions.getStatus(transaction.id);
    console.log("saveData status", status);
    return transaction.id;
  }

  async getData(chatMessages: Array<ChatMessage>): Promise<Array<ArweaveData>> {
    const arweaveData: Array<ArweaveData> = [];
    for (let i = 0; i < chatMessages.length; i++) {
      try {
        const chatMessage = chatMessages[i];
        console.log("chatMessage", chatMessage);
        const message = await this.arweave.transactions.getData(
          chatMessage.archive_id,
          { decode: true, string: true }
        );
        console.log("message", message.toString());
        arweaveData.push(
          new ArweaveData(message.toString(), chatMessage.created_on)
        );
      } catch (err) {
        console.log("getData error", err);
      }
    }

    return arweaveData;
  }
}

const arweaveService = new ArweaveService();
export default arweaveService;
