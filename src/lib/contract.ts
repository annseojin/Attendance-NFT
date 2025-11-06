import { ethers } from 'ethers';
import { contractAddress } from './constants';
import abi from './NFT.json';

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: any = null;

if (typeof window !== 'undefined' && (window as any).ethereum) {
  provider = new ethers.BrowserProvider((window as any).ethereum);
  contract = new ethers.Contract(contractAddress, abi, provider);
}

export async function connectWallet() {
  signer = await provider!.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  return await signer.getAddress();
}

export async function checkIn(name: string, studentId: string) {
  const tx = await contract.checkIn(name, studentId);
  await tx.wait();
  return tx.hash;
}

export async function getCurrentId() {
  return await contract.currentId();
}

export async function getAttendees() {
  return await contract.getAttendees();
}
