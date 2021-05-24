import { Connection } from "@solana/web3.js";
import React, { FC, useState } from "react";
import messageService from "../solana/messages";
import { WalletAdapter } from "../solana/wallet";
import "./MessageSender.css";

interface MessageSenderProps {
  connection?: Connection;
  wallet?: WalletAdapter;
  destPubkeyStr: string;
}

const MessageSender: FC<MessageSenderProps> = ({
  connection,
  wallet,
  destPubkeyStr,
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
    const result = await messageService.sendMessage(
      connection,
      wallet,
      destPubkeyStr,
      message
    );
    console.log("onClickSubmit message sent successfully", result);
  };

  return (
    <div className="msg-container">
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
