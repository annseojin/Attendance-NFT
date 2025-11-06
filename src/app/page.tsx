'use client';
import { useState, useEffect } from 'react';
import {
  connectWallet,
  checkIn,
  getTotalCount,
  getRecords,
} from '@/lib/contract';
import { ethers } from 'ethers';

export default function Home() {
  const [account, setAccount] = useState('');
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [chainName, setChainName] = useState('');
  const [chainId, setChainId] = useState('');
  const [toast, setToast] = useState('');

  function shortenAddress(addr: string) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('ko-KR');
  }

  async function copyAddress() {
    if (typeof window === 'undefined' || !account) return;

    if (navigator?.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(account);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = account;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setToast('📋 지갑 주소가 복사되었습니다.');
    setTimeout(() => setToast(''), 2000);
  }

  async function connect() {
    const acc = await connectWallet();
    setAccount(acc);
    await refresh();
    await loadNetwork();
  }

  async function loadNetwork() {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const network = await provider.getNetwork();
    setChainName(network.name);
    setChainId(network.chainId.toString());
  }

  async function refresh() {
    const id = await getTotalCount();
    setCount(Number(id));
    const list = await getRecords();
    list.sort((a: any, b: any) => b.timestamp - a.timestamp);
    setAttendees(list);
  }

  async function onCheckIn() {
    setLoading(true);
    setMsg('');

    try {
      const txHash = await checkIn(name, studentId);
      setMsg(txHash);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNetwork();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
      <style>{`
        .spinner {
          border: 3px solid #ddd;
          border-top-color: #4f46e5;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          🎓 출석 NFT 시스템
        </h1>
        <h1 className="text-xl text-gray-500 text-center mt-1">
          92212893 | 안서진
        </h1>
        <br />

        {account && (
          <div className="text-center text-sm text-gray-700 mb-3 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {shortenAddress(account)}
              </span>
              <button
                onClick={copyAddress}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
              >
                📋
              </button>
            </div>

            {toast && <div className="text-xs text-gray-500">{toast}</div>}

            <div className="text-gray-500">
              네트워크: <b>{chainName}</b> ({chainId})
            </div>
          </div>
        )}

        <button
          onClick={connect}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition mb-6"
        >
          {account ? '지갑 다시 연결' : '지갑 연결'}
        </button>

        <div className="text-center bg-gray-50 py-4 rounded-xl border border-gray-200 mb-6">
          <div className="text-sm text-gray-500">총 출석 수</div>
          <div className="text-4xl font-bold text-gray-900 mt-1">{count}</div>
        </div>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="학번"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <button
          onClick={onCheckIn}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner"></div> 출석 중...
            </>
          ) : (
            '✅ 출석하기'
          )}
        </button>

        {msg && (
          <div className="mt-6 p-4 rounded-xl bg-gray-50 text-gray-700 text-sm border leading-relaxed">
            <div className="font-medium text-green-700 mb-2">✅ 출석 완료!</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${msg}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 transition rounded-lg text-gray-800 text-sm font-medium break-all"
            >
              🔗 트랜잭션 상세 보기
            </a>
          </div>
        )}

        {/* ✅ 출석자 목록*/}
        <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left font-medium">이름</th>
                <th className="px-4 py-2 text-left font-medium">학번</th>
                <th className="px-4 py-2 text-left font-medium">지갑 주소</th>
                <th className="px-4 py-2 text-left font-medium">날짜</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendees.map((a: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2">{a.studentId}</td>
                  <td className="px-4 py-2 font-mono">
                    {shortenAddress(a.wallet)}
                  </td>
                  <td className="px-4 py-2">{formatDate(a.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
