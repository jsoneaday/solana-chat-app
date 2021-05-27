import React, { FC } from "react";
import { format } from "date-fns";
import "./MessagesView.css";

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
    const fixedMessage = message.replace("+", "");
    if (!fixedMessage) return null;

    let fixedCreatedOn = created_on.replace("+", "");
    console.log("fixedCreatedOn", fixedCreatedOn);
    let finalCreatedOn = "";
    for (let i = 0; i < fixedCreatedOn.length; i++) {
      if (Number(fixedCreatedOn[i]) > 0 || Number(finalCreatedOn) > 0) {
        finalCreatedOn += fixedCreatedOn[i];
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
        <div>{fixedMessage}</div>
      </div>
    );
  } catch (err) {
    console.log(err);
    return null;
  }
};
