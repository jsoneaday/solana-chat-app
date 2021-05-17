import React, { useState } from "react";
import { sendMoney } from "../helpers/wallet";
import "./Sender.css";

interface SenderProps {
  didSendMoney: () => void;
}

const Sender: React.FC<SenderProps> = ({ didSendMoney }) => {
  const [amount, setAmount] = useState(0);
  const [address, setAddress] = useState("");

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value ? Number(e.target.value) : 0);
  };

  const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value ? e.target.value.toString() : "");
  };

  const onClickSendMoney = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    await sendMoney(address, amount);
    didSendMoney();
  };

  return (
    <form className="send-container">
      <div className="send-inputs">
        <div className="send-top-left">
          <label htmlFor="amount">Amount (lamports)</label>
        </div>
        <div className="send-mid-left">
          <label htmlFor="address">Address</label>
        </div>
        <div className="send-top-right">
          <input type="text" value={amount} onChange={onChangeAmount} />
        </div>
        <div className="send-mid-right">
          <input type="text" value={address} onChange={onChangeAddress} />
        </div>
        <div className="send-bottom-right">
          <button className="send-buttons" onClick={onClickSendMoney}>
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};

export default Sender;
