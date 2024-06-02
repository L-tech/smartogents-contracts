import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContractCardProps } from "@/features/contracts/components/contract-card";
import { useState } from "react";
import { OverViewSection } from "./overview-section";
import { ScriptSection } from "./script-section";
import { DocsSection } from "./docs-section";

export const Actions = ({
  contractName,
  ipfsHash,
  address,
}: ContractCardProps) => {
  const [isOverview, setIsOverview] = useState(false);
  const [isScript, setIsScript] = useState(false);
  const [isDocs, setIsDocs] = useState(false);

  const handleOverview = () => {
    setIsOverview(true);
    setIsScript(false);
    setIsDocs(false);
  };

  const handleScript = () => {
    setIsOverview(false);
    setIsScript(true);
    setIsDocs(false);
  };

  const handleDocs = () => {
    setIsOverview(false);
    setIsScript(false);
    setIsDocs(true);
  };

  return (
    <>
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-y-3 w-full p-6 gap-x-3 glassmorphism">
        <Button
          variant={isOverview ? "default" : "outline"}
          onClick={handleOverview}
        >
          Generate Overview
        </Button>
        <Button
          variant={isScript ? "default" : "outline"}
          onClick={handleScript}
        >
          Generate Script
        </Button>
        <Button variant={isDocs ? "default" : "outline"} onClick={handleDocs}>
          Generate Docs
        </Button>
      </Card>

      {isOverview && (
        <OverViewSection
          contractName={contractName}
          ipfsHash={ipfsHash}
          address={address}
        />
      )}
      {isScript && (
        <ScriptSection
          contractName={contractName}
          ipfsHash={ipfsHash}
          address={address}
        />
      )}
      {isDocs && (
        <DocsSection
          contractName={contractName}
          ipfsHash={ipfsHash}
          address={address}
        />
      )}
    </>
  );
};
