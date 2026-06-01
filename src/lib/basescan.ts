const BASE_API = 'https://api.basescan.org/api';
const BASE_RPC = 'https://mainnet.base.org';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

function getKey() {
  return process.env.BASESCAN_API_KEY ?? '';
}

export async function getEthBalance(address: string): Promise<string> {
  const r = await fetch(
    `${BASE_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${getKey()}`
  );
  const data = await r.json();
  return data.result ?? '0';
}

export async function getTokenList(address: string) {
  const r = await fetch(
    `${BASE_API}?module=account&action=tokenlist&address=${address}&apikey=${getKey()}`
  );
  const data = await r.json();
  return Array.isArray(data.result) ? data.result : [];
}

export async function getTransactions(address: string, limit = 10) {
  const r = await fetch(
    `${BASE_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${getKey()}`
  );
  const data = await r.json();
  return Array.isArray(data.result) ? data.result : [];
}

export async function getTokenTransfers(address: string, limit = 10) {
  const r = await fetch(
    `${BASE_API}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${getKey()}`
  );
  const data = await r.json();
  return Array.isArray(data.result) ? data.result : [];
}

export async function getBaseStats() {
  const [gasResp, blockResp] = await Promise.all([
    fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
    }),
    fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 }),
    }),
  ]);
  const gasData = await gasResp.json();
  const blockData = await blockResp.json();
  const gasGwei = (parseInt(gasData.result, 16) / 1e9).toFixed(4);
  const blockNumber = parseInt(blockData.result, 16);
  return { gasGwei, blockNumber, chain: 'Base Mainnet' };
}

export async function getEthPrice(): Promise<number> {
  try {
    const r = await fetch(
      `${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await r.json();
    return data.ethereum?.usd ?? 0;
  } catch {
    return 0;
  }
}

export async function searchTokens(query: string) {
  try {
    const r = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`);
    const data = await r.json();
    return (data.coins ?? []).slice(0, 6).map((c: Record<string, string | number>) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      thumb: c.thumb,
      marketCapRank: c.market_cap_rank,
    }));
  } catch {
    return [];
  }
}
