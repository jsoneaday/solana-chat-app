import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import MessageSender from "./components/MessageSender";
import MoneySender from "./components/MoneySender";
import TransactionsView from "./components/TransactionView";
import {
  getTransactions,
  TransactionWithSignature,
} from "./solana/transactions";
import { initWallet, WalletAdapter } from "./solana/wallet";

function App() {
  const [transactions, setTransactions] = useState<
    Array<TransactionWithSignature>
  >([]);
  const conn = React.useRef<Connection>();
  const wall = React.useRef<WalletAdapter>();
  const midRow = React.useRef<HTMLDivElement | null>(null);

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

  const setMidRowScrollTop = (height: number) => {
    if (midRow.current) {
      console.log("total children height", height);
      midRow.current.scrollTop = height;
      console.log("scrollTop", midRow.current.scrollTop);
    }
  };

  const didSendMoney = () => {
    getTransactions(conn.current!, wall.current!.publicKey!).then((trans) => {
      setTransactions(trans);
    });
  };

  return (
    <div className="screen-root app-body">
      <div className="app-body-top">
        <h3>Send Money on Solana</h3>
        <MoneySender didSendMoney={didSendMoney} />
      </div>
      <div ref={midRow} className="app-body-mid">
        <TransactionsView
          transactions={transactions}
          setMidRowScrollTop={setMidRowScrollTop}
        />
      </div>
      <div className="app-body-bottom">
        <MessageSender />
      </div>
    </div>
  );
}

export default App;
