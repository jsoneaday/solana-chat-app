import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import DestWalletAddressView from "./components/DestWalletAddressView";
import MessageSender from "./components/MessageSender";
import MoneySender from "./components/MoneySender";
import MessagesView from "./components/MessagesView";
import {
  getTransactions,
  TransactionWithSignature,
} from "./solana/transactions";
import { initWallet, WalletAdapter } from "./solana/wallet";
import messageService from "./solana/messages";
import MyWalletAddressView from "./components/MyWalletAddressView";
import DestChatAddressView from "./components/DestChatAddressView";
import MyChatAddressView from "./components/MyChatAddressView";
import { getChatMessageAccountPubkey } from "./solana/accounts";

function App() {
  const [destWalletAddress, setDestWalletAddress] = useState(
    "8Ughmv792HAMJpES985tgrr4JAg8xgaGL3sMdpfx82w4"
  );
  const [destChatAddress, setDestChatAddress] = useState("");
  const [transactions, setTransactions] = useState<
    Array<TransactionWithSignature>
  >([]);
  const conn = React.useRef<Connection>();
  const [myWallet, setMyWallet] = useState<WalletAdapter | undefined>();
  const [myChatAddress, setMyChatAddress] = useState("");
  const midRow = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initWallet().then(([connection, wallet]: [Connection, WalletAdapter]) => {
      conn.current = connection;
      setMyWallet(wallet);
      console.log("wallet pubkey", wallet.publicKey);
      if (wallet.publicKey) {
        getChatMessageAccountPubkey(
          connection,
          wallet,
          messageService.CHAT_MESSAGES_SIZE
        ).then((chatPubkey) => {
          setMyChatAddress(chatPubkey.toBase58());

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
            .catch((err) =>
              console.log("error getMessageReceivedHistory", err)
            );
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
    getTransactions(conn.current!, myWallet!.publicKey!).then((trans) => {
      setTransactions(trans);
    });
  };

  return (
    <div className="screen-root app-body">
      <div className="app-body-top">
        <h3>Chat on Solana</h3>
        <MyWalletAddressView address={myWallet?.publicKey?.toBase58() ?? ""} />
        <DestWalletAddressView
          address={destWalletAddress}
          setAddress={setDestWalletAddress}
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
        <MyChatAddressView
          address={myChatAddress}
          setAddress={setMyChatAddress}
        />
        <DestChatAddressView
          address={destChatAddress}
          setAddress={setDestChatAddress}
        />
        <MessageSender
          connection={conn.current}
          wallet={myWallet}
          destPubkeyStr={destChatAddress}
        />
      </div>
    </div>
  );
}

export default App;
