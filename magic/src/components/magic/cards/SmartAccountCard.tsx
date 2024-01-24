import { useCallback, useEffect, useMemo, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { LoginProps } from '@/utils/types';
import { logout } from '@/utils/common';
import { useMagic } from '../MagicProvider';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import CardLabel from '@/components/ui/CardLabel';
import Spinner from '@/components/ui/Spinner';
import { getNetworkName, getNetworkToken } from '@/utils/network';
import { createEcdsaKernelAccountClient } from '@kerneljs/presets/zerodev'
import { polygonMumbai } from 'viem/chains'
import { type KernelAccountClient, providerToSmartAccountSigner } from '@kerneljs/core'

const SmartAccountCard = ({ token, setToken }: LoginProps) => {
  const { magic, web3 } = useMagic();

  const [balance, setBalance] = useState('...');
  const [copied, setCopied] = useState('Copy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [publicAddress, setPublicAddress] = useState(localStorage.getItem('user'));
  const [kernelClient, setKernelClient] = useState<KernelAccountClient | undefined>();

  useEffect(() => {
    const checkLoginandGetBalance = async () => {
      const isLoggedIn = await magic?.user.isLoggedIn();
      if (isLoggedIn) {
        try {
          const metadata = await magic?.user.getInfo();
          if (metadata) {
            localStorage.setItem('user', metadata?.publicAddress!);
            setPublicAddress(metadata?.publicAddress!);
          }
        } catch (e) {
          console.log('error in fetching address: ' + e);
        }
      }
    };
    setTimeout(() => checkLoginandGetBalance(), 5000);
  }, []);

  useEffect(() => {
    const getKernelAddress = async () => {
      const provider = await magic?.wallet.getProvider()
      const smartAccountSigner = await providerToSmartAccountSigner(provider!)
      const kernelClient = await createEcdsaKernelAccountClient({
        chain: polygonMumbai,
        projectId: 'YOUR_PROJECT_ID',
        signer: smartAccountSigner,
      })
      setKernelClient(kernelClient);
    }
    if (publicAddress && magic) {
      getKernelAddress();
    }
  }, [publicAddress, magic]);

  const getBalance = useCallback(async () => {
    if (publicAddress && web3) {
      const balance = await web3.eth.getBalance(publicAddress);
      if (balance == BigInt(0)) {
        setBalance('0');
      } else {
        setBalance(web3.utils.fromWei(balance, 'ether'));
      }
      console.log('BALANCE: ', balance);
    }
  }, [web3, publicAddress]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await getBalance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [getBalance]);

  useEffect(() => {
    if (web3) {
      refresh();
    }
  }, [web3, refresh]);

  useEffect(() => {
    setBalance('...');
  }, [magic]);

  const disconnect = useCallback(async () => {
    if (magic) {
      await logout(setToken, magic);
    }
  }, [magic, setToken]);

  const copy = useCallback(() => {
    if (publicAddress && copied === 'Copy') {
      setCopied('Copied!');
      navigator.clipboard.writeText(publicAddress);
      setTimeout(() => {
        setCopied('Copy');
      }, 1000);
    }
  }, [copied, publicAddress]);

  return (
    <Card>
      <CardHeader id="Wallet">Kernel Smart Wallet</CardHeader>
      {/* <CardLabel leftHeader="Status" rightAction={<div onClick={disconnect}>Disconnect</div>} isDisconnect /> */}
      <div className="flex-row">
        <div className="green-dot" />
        <div className="connected">Connected to {getNetworkName()}</div>
      </div>
      <Divider />
      <CardLabel leftHeader="Address" rightAction={!kernelClient ? <Spinner /> : <div onClick={copy}>{copied}</div>} />
      <div className="code">{!kernelClient ? 'Fetching address..' : kernelClient.account?.address}</div>
      <Divider />
      <CardLabel
        leftHeader="Balance"
        rightAction={
          isRefreshing ? (
            <div className="loading-container">
              <Spinner />
            </div>
          ) : (
            <div onClick={refresh}>Refresh</div>
          )
        }
      />
      <div className="code">
        {balance.substring(0, 7)} {getNetworkToken()}
      </div>
    </Card>
  );
};

export default SmartAccountCard;
