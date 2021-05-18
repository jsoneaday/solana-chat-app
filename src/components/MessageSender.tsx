import React, { useState } from "react";
import "./MessageSender.css";

const MessageSender = () => {
  const [message, setMessage] = useState("");
  const onChangeMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  const onClickSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    // send message here
  };

  return (
    <div className="msg-container">
      <input type="text" value={message} onChange={onChangeMessage} />
      <button onClick={onClickSubmit}>Submit</button>
    </div>
  );
};

export default MessageSender;
