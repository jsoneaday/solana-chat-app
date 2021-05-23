import React from "react";
import AddressView, { ChatAddressViewProps } from "./AddressView";

const DestChatAddressView: React.FC<ChatAddressViewProps> = ({
  address,
  setAddress,
}) => {
  return (
    <AddressView
      title="Dest. Wallet Address"
      address={address}
      setAddress={setAddress}
    />
  );
};

export default DestChatAddressView;
