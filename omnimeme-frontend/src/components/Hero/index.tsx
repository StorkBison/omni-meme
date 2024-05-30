import styled from "styled-components";
import { useWeb3Modal } from '@web3modal/react'
import { useAccount, useDisconnect, usePublicClient } from 'wagmi'
import Web3 from 'web3'
import { useEffect, useState } from "react";
import { USDCContractAddress, oracleAddress, presaleAddress, tokenPricePerUSD } from "../../constants";
import PRESALEABI from "../../constants/PreSaleABI";
import { NormalButton } from "../../theme/components";
import { BigNumber } from "@ethersproject/bignumber";
import OracleFeedAbi from "../../constants/OracleFeed";
import USDTABI from "../../constants/USDT";

const HeroWrapper = styled.div`
    position: relative;

    .backImg {
        // filter: opacity(0.1);
    }

    .container {
        position: absoulte;
        top: 0;
        left: 0;
    }
`;

const HeroHeader = styled.div`
    position: absolute;
    left: 10%;
    top: 12vw;
`;

const HeroDescription = styled.div`
    margin-top: 120px;
    width: 550px;
    font-weight: 500;
    font-size: 18px;
    text-align: left;

    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

const BuySection = styled.div`
    position: absolute;
    transform: translate(-50%, 0);
    left: 75%;
    top: 15vw;
    font-size: 16px;

    .typo {
        button {
            text-decoration-line: underline;
            color: #ffaf4c;
        }
    }
    @media (max-width: 768px) {
        font-size: 12px;
        bottom: 0;
    }
`;

const ConnectButton = styled.div`
    width: 448px;
    height: 157px;
    background-image: url('/assets/imgs/ConnectButton.png');
    background-size: 100% 100%;
    transition: all 0.3s;
    &:hover {
        background-image: url("/assets/imgs/connectbutton-hover.png");
    }
`;

const BuySectionModal = styled.div`
    min-height: 510px;
    background-image: url('/assets/imgs/dialog-bg.png');
    background-size: 100% 100%;
`;

const AddressWrapper = styled.div`
  color: black;
  font-weight: 600;
  font-size: 14px;
  line-height: 189.89%;

  span {
    font-weight: 500;
  }
`;

const TokenInput = styled.div`
  width: 100%;
  position: relative;
  margin: auto;
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    display: none;
  }
  input {
    background: transparent;
    padding: 12px 10px 12px 45px;
    gap: 6px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
  }
`;

export const HeroSection = () => {
    const [balanceToken, setBalanceToken] = useState(0.00)
    const publicClient = usePublicClient();
    const [claimedToken, setClaimedToken] = useState('0.00');
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount()
    const [tokenValue, setTokenValue] = useState(0.0);
    const [isLoading, setIsLoading] = useState(false);
    const [refferal, setRefferal] = useState('');
    const [myRefferalCode, setMyRefferalCode] = useState("")
    const onChangeOutput = async (e: any) => {
        setTokenValue(e.target.value);
    };

    useEffect(() => {
        setRefferal(localStorage.getItem("refferalCode")!);
        (async () => {
            try {
                const web3 = new Web3(window.ethereum);
                const contractInstance = new web3.eth.Contract(PRESALEABI as any, presaleAddress);
                //@ts-ignore
                const refferalStatus = await contractInstance.methods.getCodeFromAddress(address).call();
                console.log(refferalStatus)
                //@ts-ignore
                setMyRefferalCode(refferalStatus)
            } catch (e) {
                console.log(e)
            }
        })()
    }, [address])

    const onApply = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contractInstance = new web3.eth.Contract(PRESALEABI as any, presaleAddress);
            console.log(refferal)
            //@ts-ignore
            const refferalStatus = await contractInstance.methods.refferalUser(refferal).call();
            //@ts-ignore
            if (refferalStatus.refferer === '0x0000000000000000000000000000000000000000') {
                alert('not registered');
                return
            }
            //@ts-ignore
            if (refferalStatus.refferer === address) {
                alert("You can't use your refferal code")
                return
            }
            localStorage.setItem("refferalCode", refferal)
            setRefferal(refferal);
        } catch (e) {
            console.log(e)
        }
    }

    const onBuyWithEth = async () => {
        setIsLoading(true);
        try {
            const web3 = new Web3(window.ethereum);
            const contractInstance = new web3.eth.Contract(PRESALEABI as any, presaleAddress);
            const oracleContractInstance = new web3.eth.Contract(OracleFeedAbi as any, oracleAddress);
            const res = await oracleContractInstance.methods.latestRoundData().call();
            //@ts-ignore
            const ethPrice = parseInt(res.answer) / 10 ** 8;
            const etherValue = tokenValue / (tokenPricePerUSD * ethPrice)
            if (refferal === "") {
                //@ts-ignore
                await contractInstance.methods.buyTokens().send({
                    from: address,
                    //@ts-ignore
                    value: BigNumber.from(parseFloat(etherValue).toFixed(3) * 1000)
                        .mul(BigNumber.from(10).pow(15))
                        .toString(),
                });
            } else {
                //@ts-ignore
                const refferalStatus = await contractInstance.methods.refferalUser(refferal).call();
                //@ts-ignore
                if (refferalStatus.refferer === '0x0000000000000000000000000000000000000000') {
                    alert('not registered');
                    setIsLoading(false)
                    return
                }
                //@ts-ignore
                if (refferalStatus.refferer === address) {
                    alert("You can't use your refferal code")
                    setIsLoading(false)
                    return
                }
                //@ts-ignore
                await contractInstance.methods.buyTokensWithRefferal(refferal).send({
                    from: address,
                    //@ts-ignore
                    value: BigNumber.from(parseFloat(etherValue).toFixed(3) * 1000)
                        .mul(BigNumber.from(10).pow(15))
                        .toString(),
                });
            }
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    const onBuyWithUSDC = async () => {
        setIsLoading(true);
        try {
            const web3 = new Web3(window.ethereum);
            const contractInstance = new web3.eth.Contract(PRESALEABI as any, presaleAddress);
            const USDCContractInstance = new web3.eth.Contract(USDTABI as any, USDCContractAddress);
            //@ts-ignore
            const amountBigNumber = BigNumber.from(parseFloat(tokenValue).toFixed(3) * 1000)
                .mul(BigNumber.from(10).pow(15))
                .toString();
            //@ts-ignore
            const amount = BigNumber.from(parseFloat(tokenValue / tokenPricePerUSD).toFixed(3) * 1000)
                .mul(BigNumber.from(10).pow(15))
                .toString();
            //@ts-ignore
            await USDCContractInstance.methods.approve(presaleAddress, amount).send({ from: address });
            if (refferal === "") {
                //@ts-ignore
                await contractInstance.methods.buyTokensWithUSDT(amountBigNumber).send({
                    from: address,
                });
            } else {
                //@ts-ignore
                const refferalStatus = await contractInstance.methods.refferalUser(refferal).call();
                //@ts-ignore
                if (refferalStatus.refferer === '0x0000000000000000000000000000000000000000') {
                    alert('not registered');
                    setIsLoading(false)
                    return
                }

                //@ts-ignore
                if (refferalStatus.refferer === address) {
                    alert("You can't use your refferal code")
                    setIsLoading(false)
                    return
                }
                //@ts-ignore
                await contractInstance.methods.buyTokensWithUSDTWithRefferal(amountBigNumber, refferal).send({
                    from: address
                });
            }
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    const { open } = useWeb3Modal()
    const handleConnectButton = async () => {
        await open()
    }

    // useEffect(() => {
    //     if (isConnected && address !== undefined)
    //         (async () => {
    //             try {
    //                 const web3 = new Web3(window.ethereum)
    //                 const contractInstance = new web3.eth.Contract(OMNIABI, tokenAddress[publicClient.chain.id as keyof typeof tokenAddress]);
    //                 //@ts-ignore
    //                 const balance = await contractInstance.methods.balanceOf(address).call()
    //                 console.log(balance)
    //                 setBalanceToken(parseInt(web3.utils.fromWei(balance as any, "ether")))

    //                 const presaleContractInstance = new web3.eth.Contract(PRESALEABI as any, presaleAddress);
    //                 //@ts-ignore
    //                 const res = await presaleContractInstance.methods.balanceOfBuyer(address).call();
    //                 //@ts-ignore
    //                 setClaimedToken(web3.utils.fromWei(res, 'ether'));
    //             } catch (e) {
    //                 console.log(e)
    //             }
    //         })()
    // }, [address])

    return (
        <HeroWrapper className="relative w-full">
            <img
                alt="pic"
                src="/assets/imgs/hero_back.png"
                className="w-full backImg"
            />

            <div className="flex flex-col justify-center items-center">
                <HeroHeader className="">
                    <img alt="main-header" src="/assets/imgs/main-header.png" className="mb-6" />
                    <HeroDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.
                    </HeroDescription>
                </HeroHeader>


                <BuySection className="flex flex-col justify-center items-center gap-4">
                    {
                        isConnected ?
                            <BuySectionModal className="flex flex-col gap-2 p-8 text-center">
                                <AddressWrapper>
                                    <span>Phase 1 Pricing Ends June 25</span> <br />
                                    Connected Wallet <br /> <span>{address}</span>
                                </AddressWrapper>
                                <TokenInput>
                                    <div className="flex flex-row items-center justify-evenly ">
                                        <input
                                            type="number"
                                            className="block w-full text-gray-900 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter Amount of Tokens to Buy"
                                            step={1}
                                            value={tokenValue}
                                            onChange={(e: any) => onChangeOutput(e)}
                                        />
                                    </div>
                                </TokenInput>
                                <NormalButton className="py-4 mx-auto" onClick={() => onBuyWithEth()}>
                                    {isLoading ? (
                                        <>
                                            <svg
                                                aria-hidden="true"
                                                role="status"
                                                className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600"
                                                viewBox="0 0 100 101"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                    fill="currentColor"
                                                ></path>
                                                <path
                                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                    fill="#1C64F2"
                                                ></path>
                                            </svg>
                                            ...{' '}
                                        </>
                                    ) : (
                                        'Buy with Eth'
                                    )}
                                </NormalButton>
                                <NormalButton className="py-4 mx-auto" onClick={() => onBuyWithUSDC()}>
                                    {isLoading ? (
                                        <>
                                            <svg
                                                aria-hidden="true"
                                                role="status"
                                                className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600"
                                                viewBox="0 0 100 101"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                    fill="currentColor"
                                                ></path>
                                                <path
                                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                    fill="#1C64F2"
                                                ></path>
                                            </svg>
                                            ...{' '}
                                        </>
                                    ) : (
                                        'Buy with USDC'
                                    )}
                                </NormalButton>
                                <TokenInput>
                                    <div className="flex flex-row items-center justify-evenly ">
                                        <input
                                            type="text"
                                            className="block m-2 text-gray-900 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Refferal Code"
                                            value={refferal}
                                            onChange={(e: any) => setRefferal(e.target.value)}
                                        />
                                        <button className="py-4 mx-auto bg-green-400 rounded rounded-lg" onClick={onApply}>Apply</button>
                                    </div>
                                </TokenInput>
                                {
                                    myRefferalCode !== "" && <AddressWrapper> Your refferal code <br /> <span>{myRefferalCode}</span> </AddressWrapper>
                                }

                                <NormalButton className="py-4 mx-auto" onClick={() => disconnect()}>DisConnect</NormalButton>

                            </BuySectionModal>
                            : <ConnectButton onClick={() => {
                                handleConnectButton()
                            }}></ConnectButton>
                    }
                </BuySection>
            </div>
        </HeroWrapper>
    );
};

export default HeroSection;
