import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import DestChatAddressView from "./components/DestChatAddressView";
import MessageSender from "./components/MessageSender";
import MoneySender from "./components/MoneySender";
import MessagesView from "./components/MessagesView";
import {
  getTransactions,
  TransactionWithSignature,
} from "./solana/transactions";
import { initWallet, WalletAdapter } from "./solana/wallet";
import messageService from "./solana/messages";
import MyChatAddressView from "./components/MyChatAddressView";

function App() {
  const [destWalletAddress, setDestWalletAddress] = useState(
    "8Ughmv792HAMJpES985tgrr4JAg8xgaGL3sMdpfx82w4"
  );
  const [transactions, setTransactions] = useState<
    Array<TransactionWithSignature>
  >([]);
  const conn = React.useRef<Connection>();
  const [wall, setWall] = useState<WalletAdapter | undefined>();
  const midRow = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initWallet().then(([connection, wallet]: [Connection, WalletAdapter]) => {
      conn.current = connection;
      setWall(wallet);
      console.log("wallet pubkey", wallet.publicKey);
      if (wallet.publicKey) {
        messageService
          .getMessageReceivedHistory(connection, wallet)
          .then((receivedMessages) => {
            console.log("receivedMessages", receivedMessages);
            messageService
              .getMessageSentHistory(connection, destWalletAddress)
              .then((sentMessages) => {
                console.log("sentMessages", sentMessages);
                const allMessages = [...receivedMessages, ...sentMessages];
                console.log("all message history", allMessages);
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
    getTransactions(conn.current!, wall!.publicKey!).then((trans) => {
      setTransactions(trans);
    });
  };

  return (
    <div className="screen-root app-body">
      <div className="app-body-top">
        <h3>Chat on Solana</h3>
        <MyChatAddressView
          address={wall?.publicKey?.toBase58() ?? ""}
          readOnly={true}
        />
        <DestChatAddressView
          address={destWalletAddress}
          setAddress={setDestWalletAddress}
          readOnly={false}
        />
        <MoneySender
          destinationAddressStr={destWalletAddress}
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
        <MessageSender
          connection={conn.current}
          wallet={wall}
          destPubkeyStr={destWalletAddress}
        />
      </div>
    </div>
  );
}

export default App;
