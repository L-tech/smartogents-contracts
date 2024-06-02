import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CheckCheck, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export type ContractCardProps = {
  address: any;
  contractName: string;
  ipfsHash: string;
};

export const ContractCard = ({
  address,
  contractName,
  ipfsHash,
}: ContractCardProps) => {
  const [copiedHash, setCopiedHash] = useState("");
  const [copiedAddress, setCopiedAddress] = useState("");
  const navigate = useNavigate();

  const handleHashCopy = () => {
    setCopiedHash(ipfsHash);
    navigator.clipboard.writeText(ipfsHash);
    setTimeout(() => setCopiedHash(""), 3000);
  };

  const handleAddressCopy = () => {
    setCopiedAddress(address);
    navigator.clipboard.writeText(address);
    setTimeout(() => setCopiedAddress(""), 3000);
  };

  const handleClick = () => {
    navigate(`/contract/${address}`);
  };
  return (
    <>
      <Card className="contract_card ">
        <CardHeader
          className="cursor-pointer hover:opacity-25"
          onClick={handleClick}
        >
          <CardTitle className="flex items-center  orange_gradient">
            <Link2 className="mr-2" />
            {contractName}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription className="flex items-center">
            <span className="mr-1 font-medium text-xs italic">address:</span>
            <p className="truncate">{address}</p>
            <Button variant="ghost" size="icon" onClick={handleAddressCopy}>
              {copiedAddress ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </CardDescription>
          <CardDescription className="flex items-center">
            <span className="mr-1 font-medium text-xs italic">ipfsHash:</span>
            <p className="truncate">{ipfsHash}</p>
            <Button variant="ghost" size="icon" onClick={handleHashCopy}>
              {copiedHash ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
};
