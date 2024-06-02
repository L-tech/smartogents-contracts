// import { ContractList } from "@/features/contract/components/contract-list";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="w-full flex-center flex-col">
      <h1 className="head_text text-center">
        AI-Powered
        <br className="max-md:hidden" />
        <span className="orange_gradient text-center">
          Smart Contract Analyzer and Simulator
        </span>
      </h1>
      <p className="desc text-center">
        Smartogents is an AI-powered tool designed to enhance the understanding,
        testing, and simulation of smart contracts on the Galadriel Devnet. By
        combining AI agents with smart contract analysis, Smartogents provides a
        comprehensive suite of features to assist developers and users in
        interacting with smart contracts.
      </p>

      <Button asChild className="mt-5">
        <Link to="/contracts">Get Started</Link>
      </Button>

      {/* <ContractList /> */}
    </section>
  );
};

export default Home;
