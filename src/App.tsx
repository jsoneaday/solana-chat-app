import { Connection } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import "./App.css";
import MessageSender from "./components/MessageSender";
import { initWallet, WalletAdapter } from "./solana/wallet";
import messageService from "./solana/messages";
import MyWalletAddressView from "./components/MyWalletAddressView";
import DestChatAddressView from "./components/DestChatAddressView";
import MyChatAddressView from "./components/MyChatAddressView";
import { getChatMessageAccountPubkey } from "./solana/accounts";
import MessagesView, {
  createMessageProps,
  MessageItemViewProps,
} from "./components/MessagesView";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache(),
});

const DEST_CHAT_ADDRESS_KEY = "destChatAddress";
function App() {
  const [destChatAddress, setDestChatAddress] = useState(
    localStorage.getItem(DEST_CHAT_ADDRESS_KEY) ?? ""
  );
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
        createMessageProps(receivedMessages, false).then(
          (receivedMessagesProps) => {
            setReceivedMessages(receivedMessagesProps);
            if (!destChatAddress) return;

            messageService
              .getMessageSentHistory(connection, destChatAddress)
              .then((sentMessages) => {
                createMessageProps(sentMessages, true).then(
                  (sentMessagesProps) => setSentMessages(sentMessagesProps)
                );
              });
          }
        );
      })
      .catch((err) => console.log("error getMessageReceivedHistory", err));
  };

  return (
    <ApolloProvider client={client}>
      <div className="screen-root app-body">
        <div className="app-body-top">
          <h3>Chat on Solana</h3>
          <MyWalletAddressView
            address={myWallet?.publicKey?.toBase58() ?? ""}
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
    </ApolloProvider>
  );
}

export default App;
