import React, { FC } from "react";
import "./AddressView.css";

export interface ChatAddressViewProps {
  address: string;
  setAddress?: (address: string) => void;
}

export interface AddressViewProps {
  title: string;
  address: string;
  setAddress?: (address: string) => void;
}

const AddressView: FC<AddressViewProps> = ({ title, address, setAddress }) => {
  const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress && setAddress(e.target.value ?? "");
  };

  return (
    <div className="address-container">
      <strong style={{ marginRight: "0.5em" }}>{title}</strong>
      <input type="text" value={address} onChange={onChangeAddress} />
    </div>
  );
};

export default AddressView;
