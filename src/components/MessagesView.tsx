import React, { FC, useEffect, useState } from "react";
import { format } from "date-fns";
import "./MessagesView.css";
import { ChatMessage } from "../solana/messages";
import arweaveService from "../arweave/arweave";

interface MessagesViewProps {
  messages: Array<MessageItemViewProps>;
}
const MessagesView: FC<MessagesViewProps> = ({ messages }) => {
  const [viewItems, setViewItems] = useState<Array<JSX.Element | undefined>>();

  useEffect(() => {
    const sortedMessages = messages.sort((left, right) => {
      const leftCreatedOn = left.created_on.replace("+", "");
      const rightCreatedOn = right.created_on.replace("+", "");
      if (leftCreatedOn > rightCreatedOn) return 1;
      if (leftCreatedOn < rightCreatedOn) return -1;
      return 0;
    });

    let index = 0;
    const views = sortedMessages.map((msg) => {
      index += 1;
      return (
        <MessageItemView
          key={`msg-item-key-${index}`}
          message={msg.message}
          created_on={msg.created_on}
          sent={msg.sent}
        />
      );
    });
    setViewItems(views);
  }, [messages]);

  return <>{viewItems}</>;
};
export default MessagesView;

export class MessageItemViewProps {
  constructor(
    public message: string,
    public created_on: string,
    public sent: boolean
  ) {}
}
const MessageItemView: FC<MessageItemViewProps> = ({
  message,
  created_on,
  sent,
}) => {
  try {
    if (!message) return null;

    let finalCreatedOn = "";
    for (let i = 0; i < created_on.length; i++) {
      if (Number(created_on[i]) > 0 || Number(finalCreatedOn) > 0) {
        finalCreatedOn += created_on[i];
      }
    }
    if (!finalCreatedOn || finalCreatedOn.length <= 2) return null;

    console.log("finalCreatedOn", finalCreatedOn);
    //console.log("date", new Date(Number(finalCreatedOn)).toUTCString());
    const createdOnDate = format(
      new Date(Number(finalCreatedOn)),
      "MM/dd/yy hh:mm:ss"
    );
    const sentOrReceivedClass = sent
      ? "messages-view-sent"
      : "messages-view-received";

    return (
      <div className={`panel messages-view-container ${sentOrReceivedClass}`}>
        <label>{createdOnDate}</label>
        <div>{message}</div>
      </div>
    );
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function createMessageProps(
  messages: Array<ChatMessage>,
  sent: boolean
): Promise<Array<MessageItemViewProps>> {
  messages.forEach((msg) => {
    //msg.archive_id = msg.archive_id.replace("+", "");
    //msg.archive_id = msg.archive_id.replace(/[\u0010]/g, "");
    msg.created_on = msg.created_on.replace("+", "");
  });
  const filteredMessages = messages.filter(
    (msg) =>
      msg.archive_id &&
      msg.created_on &&
      !isAllZero(msg.archive_id) &&
      !isAllZero(msg.created_on)
  );
  console.log("filteredMessages", filteredMessages);
  const arweaveData = await arweaveService.getData(filteredMessages);
  const messageProps = arweaveData.map((msg) => {
    return new MessageItemViewProps(msg.message, msg.created_on, sent);
  });
  return messageProps;
}

function isAllZero(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== "0") {
      return false;
    }
  }
  return true;
}
