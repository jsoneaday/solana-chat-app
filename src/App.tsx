import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import DestWalletAddressView from "./components/DestWalletAddressView";
import MessageSender from "./components/MessageSender";
import MoneySender from "./components/MoneySender";
import TransactionView from "./components/TransactionView";
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
import MessagesView, { MessageItemViewProps } from "./components/MessagesView";

const DEST_WALLET_ADDRESS_KEY = "destWalletAddress";
const DEST_CHAT_ADDRESS_KEY = "destChatAddress";
function App() {
  const [destWalletAddress, setDestWalletAddress] = useState(
    localStorage.getItem(DEST_WALLET_ADDRESS_KEY) ??
      "8Ughmv792HAMJpES985tgrr4JAg8xgaGL3sMdpfx82w4"
  );
  const [destChatAddress, setDestChatAddress] = useState(
    localStorage.getItem(DEST_CHAT_ADDRESS_KEY) ?? ""
  );
  const [transactions, setTransactions] = useState<
    Array<TransactionWithSignature>
  >([]);
  const [receivedMessages, setReceivedMessages] = useState<
    Array<MessageItemViewProps>
  >([]);
  const [sentMessages, setSentMessages] = useState<Array<MessageItemViewProps>>(
    []
  );
  const conn = React.useRef<Connection>();
  const [myWallet, setMyWallet] = useState<WalletAdapter | undefined>();
  const [myChatAddress, setMyChatAddress] = useState("");
  const midRow = React.useRef<HTMLDivElement | null>(null);

  const setDestinationWalletAddress = (address: string) => {
    localStorage.setItem(DEST_WALLET_ADDRESS_KEY, address);
    setDestWalletAddress(address);
  };
  const setDestinationChatAddress = (address: string) => {
    localStorage.setItem(DEST_CHAT_ADDRESS_KEY, address);
    setDestChatAddress(address);
  };
  useEffect(() => {
    initWallet().then(([connection, wallet]: [Connection, WalletAdapter]) => {
      conn.current = connection;
      setMyWallet(wallet);
      if (wallet.publicKey) {
        getChatMessageAccountPubkey(
          connection,
          wallet,
          messageService.CHAT_MESSAGES_SIZE
        ).then((walletChatPubkey) => {
          setMyChatAddress(walletChatPubkey.toBase58());

          getMessagesInternal(connection, walletChatPubkey.toBase58());
        });
      }
    });
  }, []);

  const getMessages = () => {
    if (conn.current) {
      getMessagesInternal(conn.current, myChatAddress);
    }
  };

  const getMessagesInternal = (
    connection: Connection,
    walletChatPubkeyStr: string
  ) => {
    messageService
      .getMessageReceivedHistory(connection, walletChatPubkeyStr)
      .then((receivedMessages) => {
        const receivedMessagesProps = receivedMessages
          .filter((msg) => msg.archive_id && msg.created_on)
          .map((msg) => {
            return new MessageItemViewProps(
              msg.archive_id,
              msg.created_on,
              false
            );
          });
        setReceivedMessages(receivedMessagesProps);
        messageService
          .getMessageSentHistory(connection, destChatAddress)
          .then((sentMessages) => {
            const sentMessagesProps = sentMessages
              .filter((msg) => msg.archive_id && msg.created_on)
              .map((msg) => {
                return new MessageItemViewProps(
                  msg.archive_id,
                  msg.created_on,
                  true
                );
              });
            setSentMessages(sentMessagesProps);
          });
      })
      .catch((err) => console.log("error getMessageReceivedHistory", err));
  };

  const setMidRowScrollTop = (height: number) => {
    if (midRow.current) {
      midRow.current.scrollTop = height;
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
          setAddress={setDestinationWalletAddress}
        />
        <MoneySender
          destinationAddressStr={destWalletAddress}
          didSendMoney={didSendMoney}
        />
      </div>
      <div ref={midRow} className="app-body-mid">
        <MessagesView messages={[...receivedMessages, ...sentMessages]} />
      </div>
      <div className="app-body-bottom">
        <MyChatAddressView
          address={myChatAddress}
          setAddress={setMyChatAddress}
        />
        <DestChatAddressView
          address={destChatAddress}
          setAddress={setDestinationChatAddress}
        />
        <MessageSender
          connection={conn.current}
          wallet={myWallet}
          destPubkeyStr={destChatAddress}
          getMessages={getMessages}
        />
      </div>
    </div>
  );
}

export default App;
