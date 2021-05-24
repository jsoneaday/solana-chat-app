import React from "react";
import AddressView, { WrapperAddressViewProps } from "./AddressView";

const MyWalletAddressView: React.FC<WrapperAddressViewProps> = ({
  address,
  setAddress,
}) => {
  return (
    <AddressView
      title="My Wallet Address"
      address={address}
      setAddress={setAddress}
      readOnly={true}
    />
  );
};

export default MyWalletAddressView;
