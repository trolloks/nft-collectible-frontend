import "./App.css";
import contract from "./contracts/NFTCollectible.json";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x86a181876C6f0A5112d75642f8c295BdD6BD6339";
const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentTokenId, setCurrentTokenId] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    }

    console.log("Wallet exists! We're ready to go!");

    const accounts = await ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log(`Found an authorised account: ${account}`);
      setCurrentAccount(account);
    } else {
      console.warn(`No authorised account found`);
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(`Found an account! Address: ${accounts[0]}`);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialise payment");
        const nftTxn = await nftContract.mintNFTs(1, {
          value: ethers.utils.parseEther("0.01"),
        });

        console.log("Mining... please wait");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );

        const tokenIds = await nftContract.tokensOfOwner(currentAccount);
        setCurrentTokenId(tokenIds[tokenIds.length - 1]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <button
        onClick={connectWalletHandler}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    );
  };

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="main-app">
      <h1>Scrappy Squirrels Tutorial</h1>
      <div>{currentAccount ? mintNftButton() : connectWalletButton()}</div>
      {currentTokenId && (
        <div>
          <nft-card
            contractAddress={contractAddress}
            tokenId={currentTokenId}
            network="rinkeby"
          ></nft-card>
          <script src="https://unpkg.com/embeddable-nfts/dist/nft-card.min.js"></script>

          <a
            href={` https://testnets.opensea.io/assets/0x86a181876c6f0a5112d75642f8c295bdd6bd6339/${currentTokenId}`}
            target="_blank"
          >
            See on OpenSeas
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
