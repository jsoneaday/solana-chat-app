import React from "react";
import AddressView, { WrapperAddressViewProps } from "./AddressView";

const DestWalletAddressView: React.FC<WrapperAddressViewProps> = ({
  address,
  setAddress,
}) => {
  return (
    <AddressView
      title="Dest. Wallet Address"
      address={address}
      setAddress={setAddress}
      readOnly={false}
    />
  );
};

export default DestWalletAddressView;
