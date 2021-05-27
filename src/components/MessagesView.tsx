import React, { FC } from "react";
import "./MessagesView.css";

interface MessagesViewProps {
  messages: Array<MessageItemViewProps>;
}
const MessagesView: FC<MessagesViewProps> = ({ messages }) => {
  let index = 0;
  const views = messages.map((msg) => {
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
  const sentOrReceivedClass = sent
    ? "messages-view-sent"
    : "messages-view-received";
  return (
    <div className={`panel messages-view-container ${sentOrReceivedClass}`}>
      <label>{created_on}</label>
      <div>{message}</div>
    </div>
  );
};
