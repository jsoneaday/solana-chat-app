import React from "react";
import AddressView, { AddressViewProps } from "./AddressView";

const DestinationAddressView: React.FC<AddressViewProps> = ({
  title,
  address,
  setAddress,
}) => {
  return (
    <AddressView title={title} address={address} setAddress={setAddress} />
  );
};

export default DestinationAddressView;
