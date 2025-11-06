'use client';
import { useState } from 'react';
import {
  connectWallet,
  checkIn,
  getCurrentId,
  getAttendees,
} from '@/lib/contract';

export default function Home() {
  const [account, setAccount] = useState('');
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function shortenAddress(addr: string) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(account);
    setMsg('📋 지갑 주소가 복사되었습니다.');
    setTimeout(() => setMsg(''), 2000);
  }

  async function connect() {
    const acc = await connectWallet();
    setAccount(acc);
    refresh();
  }

  async function refresh() {
    const id = await getCurrentId();
    setCount(Number(id));
    const list = await getAttendees();
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

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          🎓 출석 NFT 시스템
        </h1>
        <h1 className="text-xl text-gray-500 dark:text-gray-400 text-center mt-1">
          92212893 | 안서진
        </h1>
        <br></br>

        {account && (
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm mb-3">
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

        {/* ✅ 여기 수정된 메시지 UI */}
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

        <div className="mt-8 bg-gray-50 p-4 rounded-xl border">
          <div className="font-semibold mb-2">📋 출석자 목록</div>
          {attendees.map((a, i) => (
            <div key={i} className="text-sm border-b py-1">
              {a.name} ({a.studentId}) — {shortenAddress(a.wallet)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
