import { ethers } from 'ethers';
import abi from './NFT.json';
import { contractAddress } from './constants';

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;

// ✅ 브라우저 + 메타마스크 환경에서만 provider 생성
if (typeof window !== 'undefined' && (window as any).ethereum) {
  provider = new ethers.BrowserProvider((window as any).ethereum);
  contract = new ethers.Contract(contractAddress, abi, provider);
}

// ✅ 지갑 연결 + 네트워크 자동 전환
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask가 필요합니다.');

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    }
  }

  // ✅ signer 획득
  signer = await provider!.getSigner();

  // ✅ signer 기반으로 read → write 가능한 contract 재생성
  contract = new ethers.Contract(contractAddress, abi, signer);

  return await signer.getAddress();
}

// ✅ 출석 처리 (트랜잭션 발생)
export async function checkIn(name: string, studentId: string) {
  if (!contract || !signer) throw new Error('지갑이 연결되지 않았습니다.');
  const tx = await contract.checkIn(name, studentId);
  await tx.wait();
  return tx.hash;
}

// ✅ 총 출석 수 조회 (read only)
export async function getCurrentId() {
  if (!contract) return 0;
  return await contract.currentId();
}

// ✅ 출석자 전체 목록 조회 (read only)
export async function getAttendees() {
  if (!contract) return [];
  return await contract.getAttendees();
}
