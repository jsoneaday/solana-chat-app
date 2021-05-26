import React, { FC } from "react";

interface MessagesViewProps {
  messages: Array<MessageItemViewProps>;
}

const MessagesView: FC<MessagesViewProps> = ({ messages }) => {
  const views = messages.map((msg) => {
    return (
      <MessageItemView message={msg.message} created_on={msg.created_on} />
    );
  });
  return <>{views}</>;
};

export default MessagesView;

interface MessageItemViewProps {
  message: string;
  created_on: string;
}
const MessageItemView: FC<MessageItemViewProps> = ({ message, created_on }) => {
  return (
    <div className="trans-item trans-meta">
      <label>{created_on}</label>
      <div>{message}</div>
    </div>
  );
};
