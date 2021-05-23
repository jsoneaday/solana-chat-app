import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import DestinationAddressView from "./components/DestinationAddressView";
import MessageSender from "./components/MessageSender";
import MoneySender from "./components/MoneySender";
import MessagesView from "./components/MessagesView";
import {
  getTransactions,
  TransactionWithSignature,
} from "./solana/transactions";
import { initWallet, WalletAdapter } from "./solana/wallet";
import messageService from "./solana/messages";

function App() {
  const [destAddress, setDestAddress] = useState(
    "8Ughmv792HAMJpES985tgrr4JAg8xgaGL3sMdpfx82w4"
  );
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
      console.log("wallet pubkey", wallet.publicKey);
      if (wallet.publicKey) {
        messageService
          .getMessageReceivedHistory(connection, wallet)
          .then((receivedMessageContainer) => {
            console.log("receivedMessages", receivedMessageContainer);
            messageService
              .getMessageSentHistory(connection, destAddress)
              .then((sentMessageContainer) => {
                console.log("sentMessages", sentMessageContainer);
                const allMessages = [
                  ...receivedMessageContainer,
                  ...sentMessageContainer,
                ];
                console.log("message history", allMessages);
              });
          })
          .catch((err) => console.log("error getMessageReceivedHistory", err));
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
        <h3>Chat on Solana</h3>
        <DestinationAddressView
          title="Chat Destination Address"
          address={destAddress}
          setAddress={setDestAddress}
        />
        <MoneySender
          destinationAddressStr={destAddress}
          didSendMoney={didSendMoney}
        />
      </div>
      <div ref={midRow} className="app-body-mid">
        <MessagesView
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
