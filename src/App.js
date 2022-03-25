import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20abi from "./ABCTokenAbi.json";
import ErrorMessage from "./ErrorMessage";
import 'bootstrap/dist/css/bootstrap.min.css';
import { button } from 'react-bootstrap';
import TxList from "./TxList";

export default function App() {
  const [txs, setTxs] = useState([]);
  const [contractListened, setContractListened] = useState();
  const [error, setError] = useState();
  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-"
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: "-",
    balance: "-"
  });

  useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract(
        contractInfo.address,
        erc20abi,
        provider
      );

      erc20.on("Transfer", (from, to, amount, event) => {
        console.log({ from, to, amount, event });

        setTxs((currentTxs) => [
          ...currentTxs,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: String(amount)
          }
        ]);
      });
      setContractListened(erc20);

      return () => {
        contractListened.removeAllListeners();
      };
    }
  }, [contractInfo.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const erc20 = new ethers.Contract(data.get("addr"), erc20abi, provider);

    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();

    setContractInfo({
      address: data.get("addr"),
      tokenName,
      tokenSymbol,
      totalSupply
    });
  };

  const getMyBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, provider);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await erc20.balanceOf(signerAddress);

    setBalanceInfo({
      address: signerAddress,
      balance: String(balance)
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.transfer(data.get("recipient"), data.get("amount"));
  };

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <div>
        <form className="m-4" onSubmit={handleSubmit}>
          <div className="credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
            <main className="mt-4 p-4">
              <img src='data:image/jpeg;base64,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' alt= 'logo'/>
              <h1 className="text-xl font-semibold text-gray-700 text-center">
                Read contract
              </h1>
              <div className="">
                <div className="my-3">
                  <input
                    type="text"
                    name="addr"
                    className="input input-bordered block w-full focus:ring focus:outline-none"
                    placeholder="ERC20 contract address"
                  />
                </div>
              </div>
            </main>
            <footer className="p-4">
              <button
                type="submit"
                className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
              >
                Get token info
              </button>
            </footer>
            <div className="px-4">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Total supply</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>{contractInfo.tokenName}</th>
                      <td>{contractInfo.tokenSymbol}</td>
                      <td>{String(contractInfo.totalSupply)}</td>
                      <td>{contractInfo.deployedAt}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4">
              <button
                onClick={getMyBalance}
                type="submit"
                className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
              >
                Get my balance
              </button>
            </div>
            <div className="px-4">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>{balanceInfo.address}</th>
                      <td>{balanceInfo.balance}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
        <div className="m-4 credit-card w-full lg:w-3/4 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
          <div className="mt-4 p-4">
            <h1 className="text-xl font-semibold text-gray-700 text-center">
              Transfer
            </h1>

            <form onSubmit={handleTransfer}>
              <div className="my-3">
                <input
                  type="text"
                  name="recipient"
                  className="input input-bordered block w-full focus:ring focus:outline-none"
                  placeholder="Recipient address"
                />
              </div>
              <div className="my-3">
                <input
                  type="text"
                  name="amount"
                  className="input input-bordered block w-full focus:ring focus:outline-none"
                  placeholder="Amount to transfer"
                />
              </div>
              <footer className="p-4">
                <button
                  type="submit"
                  className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                >
                  Transfer
                </button>
              </footer>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
}
