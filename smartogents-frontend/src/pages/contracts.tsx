import { Button } from "@/components/ui/button";
import { ContractList } from "@/features/contracts/components/contract-list";
import { Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Contracts = () => {
  return (
    <section className="feed">
      <div className="flex justify-between w-full items-center">
        <h3 className="orange_gradient font-bold text-xl">Contracts</h3>
        <Button asChild className=" blue_gradient text-white">
          <Link to="/upload-contract">
            <Upload className="text-sm w-5 mr-3 h-5" />
            Upload
          </Link>
        </Button>
      </div>

      <ContractList />
    </section>
  );
};

export default Contracts;
