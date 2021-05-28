import React, { FC, useEffect } from "react";
import { TransactionWithSignature } from "../solana/transactions";
import "./TransactionView.css";

interface TransactionViewProps {
  transactions: Array<TransactionWithSignature>;
  setMidRowScrollTop: (total: number) => void;
}

const TransactionView: FC<TransactionViewProps> = ({
  transactions,
  setMidRowScrollTop,
}) => {
  const totalItemsHeight = React.useRef(0);
  const incrementItemsHeight = (height: number) => {
    totalItemsHeight.current += height;
  };
  const view = transactions.map((trans) => {
    return (
      <TransactionItemView
        key={trans.signature}
        transaction={trans}
        incrementItemsHeight={incrementItemsHeight}
      />
    );
  });

  useEffect(() => {
    setMidRowScrollTop(totalItemsHeight.current);
  });

  return <>{view}</>;
};

interface TransactionItemViewProps {
  transaction: TransactionWithSignature;
  incrementItemsHeight: (count: number) => void;
}
const TransactionItemView: FC<TransactionItemViewProps> = ({
  transaction,
  incrementItemsHeight,
}) => {
  const itemHeight = React.useRef<HTMLUListElement | null>(null);
  const signature = transaction.signature?.toString();
  const meta = transaction.confirmedTransaction.meta;
  const trans = transaction.confirmedTransaction.transaction;
  let amount = 0;
  if (meta) {
    amount = meta.preBalances[0] - meta.postBalances[0];
  }
  useEffect(() => {
    incrementItemsHeight(itemHeight.current?.clientHeight ?? 0);
  });

  return (
    <ul ref={itemHeight} className="panel trans-meta">
      <li key={signature + "title"}>
        <strong>Sent</strong>&nbsp;
        {meta?.fee}
      </li>
      <li key={signature + "amount"}>
        <label>Sent Amount:</label>&nbsp;
        {amount}
      </li>
      <li key={signature + "fee"}>
        <label>Fee:</label>&nbsp;
        {meta?.fee}
      </li>
    </ul>
  );
};

export default TransactionView;
