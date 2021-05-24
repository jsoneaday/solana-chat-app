import React from "react";
import AddressView, { ChatAddressViewProps } from "./AddressView";

const DestChatAddressView: React.FC<ChatAddressViewProps> = ({
  address,
  setAddress,
  readOnly,
}) => {
  return (
    <AddressView
      title="Dest. Wallet Address"
      address={address}
      setAddress={setAddress}
      readOnly={readOnly}
    />
  );
};

export default DestChatAddressView;
