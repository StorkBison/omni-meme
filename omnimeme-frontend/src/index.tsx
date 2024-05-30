import ReactDOM from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, goerli, mainnet, polygon, polygonMumbai } from 'wagmi/chains'
import "./theme/global.scss";
import "@fontsource/poppins";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/500.css";
import "@fontsource/rammetto-one";

const chains = [arbitrum, mainnet, polygon, polygonMumbai, goerli]
const projectId = '494a6e2744d91d4aa8ae5d29486066cd'
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)


ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <>
            <WagmiConfig config={wagmiConfig}>
                <Router>
                    <App />
                </Router>
            </WagmiConfig>
            <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
        </>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
