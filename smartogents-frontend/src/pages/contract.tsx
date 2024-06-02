import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { CheckCheck, Copy, Loader2 } from "lucide-react";
import ABI from "@/constants/ContractABIRegistry.json";
import { Actions } from "@/features/contract/components/actions";
import { useContractRead, useContract } from "@thirdweb-dev/react";

const Contract = () => {
  const { address } = useParams();
  const [copiedHash, setCopiedHash] = useState("");
  const [copiedAddress, setCopiedAddress] = useState("");

  const { data: contract } = useContract(
    "0xd74C08f8ffDF88C807367813Ad64a960618f4dcC",
    ABI
  );
  const { data, isLoading, error } = useContractRead(contract, "getABIRecord", [
    address,
  ]);

  const handleHashCopy = (ipfsHash: string) => {
    setCopiedHash(ipfsHash);
    navigator.clipboard.writeText(ipfsHash);
    setTimeout(() => setCopiedHash(""), 3000);
  };

  const handleAddressCopy = (address: string) => {
    setCopiedAddress(address);
    navigator.clipboard.writeText(address);
    setTimeout(() => setCopiedAddress(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-2 items-center">
        <Loader2 className="w-7 h-7 animate-spin" />
        <p className="text-muted-foreground">Fetching ABI</p>
      </div>
    );
  }

  if (error) {
    return <div>Error</div>;
  }

  return (
    <section className="w-full max-w-full flex-start flex-col">
      <h1 className="head_text text-left">
        <span className="orange_gradient bg-clip">{data?.contractName}</span>
      </h1>
      <div className="flex truncate items-center max-w-[350px] w-full">
        <span className="mr-1 font-medium text-muted-foreground text-xs italic">
          address:
        </span>
        <p className="truncate text-muted-foreground">{address}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAddressCopy(address as string)}
        >
          {copiedAddress ? (
            <CheckCheck className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="flex truncate items-center max-w-[350px] w-full">
        <span className="mr-1 font-medium text-xs italic text-muted-foreground">
          ipfsHash:
        </span>
        <p className="truncate  text-muted-foreground">{data?.ipfsHash}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleHashCopy(data?.ipfsHash)}
        >
          {copiedHash ? (
            <CheckCheck className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Actions
        contractName={data?.contractName}
        ipfsHash={data?.ipfsHash}
        address={address as string}
      />
    </section>
  );
};

export default Contract;
