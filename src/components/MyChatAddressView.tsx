import React from "react";
import AddressView, { ChatAddressViewProps } from "./AddressView";

const MyChatAddressView: React.FC<ChatAddressViewProps> = ({
  address,
  setAddress,
  readOnly,
}) => {
  return (
    <AddressView
      title="My Wallet Address"
      address={address}
      setAddress={setAddress}
      readOnly={readOnly}
    />
  );
};

export default MyChatAddressView;
