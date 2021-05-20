import React from "react";
import "./DestinationAddressSetter.css";

interface DestinationAddressSetterProps {
  address: string;
  setAddress: (address: string) => void;
}
const DestinationAddressSetter: React.FC<DestinationAddressSetterProps> = ({
  address,
  setAddress,
}) => {
  const onChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value ? e.target.value.toString() : "");
  };

  return (
    <div className="dest-container">
      <strong style={{ marginRight: "0.5em" }}>Destination Address</strong>
      <input type="text" value={address} onChange={onChangeAddress} />
    </div>
  );
};

export default DestinationAddressSetter;
