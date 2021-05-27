import React, { useState } from "react";
import { sendMoney } from "../solana/wallet";
import "./MoneySender.css";

interface MoneySenderProps {
  destinationAddressStr: string;
  didSendMoney: () => void;
}

const MoneySender: React.FC<MoneySenderProps> = ({
  destinationAddressStr,
  didSendMoney,
}) => {
  const [amount, setAmount] = useState(0);

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value ? Number(e.target.value) : 0);
  };

  const onClickSendMoney = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    await sendMoney(destinationAddressStr, amount);
    didSendMoney();
  };

  return (
    <form className="panel">
      <div className="send-inputs">
        <strong className="send-top-left">Send Money</strong>
        <div className="send-mid-left">
          <label htmlFor="amount">Amount (lamports)</label>
        </div>
        <div className="send-mid-right">
          <input type="text" value={amount} onChange={onChangeAmount} />
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

export default MoneySender;
