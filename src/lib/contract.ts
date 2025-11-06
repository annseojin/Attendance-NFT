import { ethers } from 'ethers';
import abi from './NFT.json';
import { contractAddress } from './constants';

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

if (typeof window !== 'undefined' && (window as any).ethereum) {
  provider = new ethers.BrowserProvider((window as any).ethereum);
  contract = new ethers.Contract(contractAddress, abi, provider);
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask가 필요합니다.');

  signer = await provider!.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);

  return await signer.getAddress();
}

export async function checkIn(name: string, studentId: string) {
  if (!contract || !signer) throw new Error('지갑이 연결되지 않았습니다.');
  const tx = await contract.checkIn(name, studentId);
  await tx.wait();
  return tx.hash;
}

export async function getTotalCount() {
  return await contract!.totalCount();
}

export async function getRecords() {
  const data = await contract!.getRecords();
  return data.map((r: any) => ({
    wallet: r.wallet,
    name: r.name,
    studentId: r.studentId,
    timestamp: Number(r.timestamp) * 1000, 
  }));
}