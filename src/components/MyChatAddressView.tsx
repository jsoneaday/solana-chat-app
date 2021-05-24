import React from "react";
import AddressView, { WrapperAddressViewProps } from "./AddressView";

const MyChatAddressView: React.FC<WrapperAddressViewProps> = ({
  address,
  setAddress,
}) => {
  return (
    <AddressView
      title="My Chat Address"
      address={address}
      setAddress={setAddress}
      readOnly={true}
    />
  );
};

export default MyChatAddressView;
