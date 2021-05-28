import React, { FC } from "react";
import { format } from "date-fns";
import "./MessagesView.css";
import { create } from "ts-node";
import { ChatMessage } from "../solana/messages";

interface MessagesViewProps {
  messages: Array<MessageItemViewProps>;
}
const MessagesView: FC<MessagesViewProps> = ({ messages }) => {
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
  return <>{views}</>;
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

export function createMessageProps(
  messages: Array<ChatMessage>,
  sent: boolean
): Array<MessageItemViewProps> {
  messages.forEach((msg) => {
    msg.archive_id = msg.archive_id.replace("+", "");
    msg.created_on = msg.created_on.replace("+", "");
  });
  const messageProps = messages
    .filter((msg) => msg.archive_id && msg.created_on)
    .map((msg) => {
      return new MessageItemViewProps(msg.archive_id, msg.created_on, sent);
    });
  return messageProps;
}
