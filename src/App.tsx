import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import Sender from "./components/Sender";
import TransactionsView from "./components/TransactionView";
import {
  getTransactions,
  TransactionWithSignature,
} from "./helpers/transactions";
import { initWallet, WalletAdapter } from "./helpers/wallet";

function App() {
  const [transactions, setTransactions] =
    useState<Array<TransactionWithSignature>>();
  const conn = React.useRef<Connection>();
  const wall = React.useRef<WalletAdapter>();

  useEffect(() => {
    initWallet().then(([connection, wallet]: [Connection, WalletAdapter]) => {
      conn.current = connection;
      wall.current = wallet;
      if (wallet.publicKey) {
        getTransactions(connection, wallet.publicKey).then((trans) => {
          setTransactions(trans);
        });
      }
    });
  }, []);

  const didSendMoney = () => {
    getTransactions(conn.current!, wall.current!.publicKey!).then((trans) => {
      setTransactions(trans);
    });
  };

  return (
    <div className="screen-root app-body">
      <div className="app-body-top">
        <h3>Send Money on Solana</h3>
        <Sender didSendMoney={didSendMoney} />
      </div>
      <main className="app-body-mid">
        <TransactionsView transactions={transactions} />
      </main>
    </div>
  );
}

export default App;
