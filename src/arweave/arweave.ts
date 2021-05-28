import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import TestWeave from "testweave-sdk";

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

  async saveData(transData: any): Promise<string> {
    console.log("start saveData");
    const data = JSON.stringify(transData);
    const transaction = await this.arweave.createTransaction(
      { data },
      this.walletKey!
    );
    transaction.addTag("Content-Type", "application/json");
    await this.arweave.transactions.sign(transaction, this.walletKey!);
    await this.arweave.transactions.post(transaction);
    console.log("posted transaction");
    await this.testWeave!.mine(); // need this to force immediate mine of related block
    console.log("forced mine");
    const status = await this.arweave.transactions.getStatus(transaction.id);
    console.log("saveData status", status);
    return transaction.id;
  }
}

const arweaveService = new ArweaveService();
export default arweaveService;
