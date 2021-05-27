import React, { FC } from "react";
import "./AddressView.css";

export interface WrapperAddressViewProps {
  address: string;
  setAddress?: (address: string) => void;
}

export interface AddressViewProps {
  title: string;
  address: string;
  setAddress?: (address: string) => void;
  readOnly: boolean;
}

const AddressView: FC<AddressViewProps> = ({
  title,
  address,
  setAddress,
  readOnly,
}) => {
  const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress && setAddress(e.target.value ?? "");
  };

  return (
    <div className="panel address-container">
      <strong style={{ marginRight: "0.5em" }}>{title}</strong>
      <input
        type="text"
        value={address}
        onChange={onChangeAddress}
        readOnly={readOnly}
      />
    </div>
  );
};

export default AddressView;
