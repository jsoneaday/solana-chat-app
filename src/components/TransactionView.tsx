import React, { FC, useEffect, useState } from "react";
import { TransactionWithSignature } from "../helpers/transactions";
import "./TransactionView.css";

interface TransactionsViewProps {
  transactions?: Array<TransactionWithSignature>;
}

const TransactionsView: FC<TransactionsViewProps> = ({ transactions }) => {
  const [localTrans, setLocalTrans] = useState<JSX.Element[]>();

  useEffect(() => {
    const newTrans = transactions?.map((trans) => {
      return <TransactionItemView key={trans.signature} transaction={trans} />;
    });
    setLocalTrans(newTrans);
    console.log("width", window.screen.width);
  }, [transactions]);

  return <>{localTrans}</>;
};

interface TransactionItemViewProps {
  transaction: TransactionWithSignature;
}
const TransactionItemView: FC<TransactionItemViewProps> = ({ transaction }) => {
  const signature = transaction.signature?.toString();
  const meta = transaction.confirmedTransaction.meta;
  const trans = transaction.confirmedTransaction.transaction;
  let amount = 0;
  if (meta) {
    amount = meta.preBalances[0] - meta.postBalances[0];
  }
  return (
    <ul className="trans-item trans-meta">
      <li key={signature + "signature"}>
        <label>Tx:</label> &nbsp;
        {signature}
      </li>
      <li key={signature + "fee"}>
        <label>Fee:</label>&nbsp;
        {meta?.fee}
      </li>
      <li key={signature + "amount"}>
        <label>Sent Amount:</label>&nbsp;
        {amount}
      </li>
      <li key={signature + "sender"}>
        <label>Sender:</label>&nbsp;
        {trans.instructions[0].keys[0].pubkey.toBase58()}
      </li>
      <li key={signature + "sender-balance"}>
        <label>Sender Balance:</label>&nbsp;
        {meta?.postBalances[0]}
      </li>
      <li key={signature + "receiver"}>
        <label>Receiver:</label>&nbsp;
        {trans.instructions[0].keys[1].pubkey.toBase58()}
      </li>
      <li key={signature + "receiver-balance"}>
        <label>Receiver Balance:</label>&nbsp;
        {meta?.postBalances[1]}
      </li>
    </ul>
  );
};

export default TransactionsView;
