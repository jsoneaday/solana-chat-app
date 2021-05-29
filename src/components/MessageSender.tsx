import { Connection } from "@solana/web3.js";
import React, { FC, useState } from "react";
import arweaveService from "../arweave/arweave";
import messageService from "../solana/messages";
import { WalletAdapter } from "../solana/wallet";
import "./MessageSender.css";

interface MessageSenderProps {
  connection?: Connection;
  wallet?: WalletAdapter;
  destPubkeyStr: string;
  getMessages: () => void;
}

const MessageSender: FC<MessageSenderProps> = ({
  connection,
  wallet,
  destPubkeyStr,
  getMessages,
}) => {
  const [message, setMessage] = useState("");
  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  const onClickSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!connection || !wallet) {
      return;
    }

    // 1 save message to arweave
    const txid = await arweaveService.saveData(message);
    console.log("saved txid", txid);
    // 2 save arweave txid to solana
    const result = await messageService.sendMessage(
      connection,
      wallet,
      destPubkeyStr,
      txid
    );
    console.log("onClickSubmit message sent successfully", result);
    getMessages();
  };

  return (
    <div className="panel">
      <input
        className="msg-input"
        type="text"
        value={message}
        onChange={onChangeMessage}
      />
      <button onClick={onClickSubmit}>Submit</button>
    </div>
  );
};

export default MessageSender;
