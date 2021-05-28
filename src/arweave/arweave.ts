import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import TestWeave from "testweave-sdk";

class ArweaveService {
  arweave: Arweave;
  testWeave?: TestWeave;
  walletKey?: JWKInterface;

  constructor() {
    this.arweave = Arweave.init({
      host: "127.0.0.1",
      port: 1984,
      protocol: "http",
    });

    TestWeave.init(this.arweave).then((testWeave) => {
      this.testWeave = testWeave;
      this.walletKey = this.testWeave.rootJWK;
    });
  }

  async saveData(transData: any): Promise<void> {
    const data = JSON.stringify(transData);
    const transaction = await this.arweave.createTransaction(
      { data },
      this.walletKey
    );
    await this.arweave.transactions.sign(transaction, this.walletKey);
    await this.arweave.transactions.post(transaction);
    const status = await this.arweave.transactions.getStatus(transaction.id);
    await this.testWeave!.mine(); // need this to force immediate mine of related block
    console.log("saveData status", status);
  }
}

const arweaveService = new ArweaveService();
export default arweaveService;
