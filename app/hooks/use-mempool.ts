import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from 'react-query';

import { selectAddress } from '@store/keys';
import { ApiResource } from '@models';
import { useFetchAccountNonce } from '@hooks/use-fetch-account-nonce';
import { MempoolTransaction } from '@blockstack/stacks-blockchain-api-types';
import { useApi } from './use-api';

interface UseMempool {
  mempoolTxs: MempoolTransaction[];
  outboundMempoolTxs: MempoolTransaction[];
  refetch(): Promise<any>;
}
export function useMempool(): UseMempool {
  const api = useApi();
  const address = useSelector(selectAddress);
  const { nonce } = useFetchAccountNonce();

  const mempoolFetcher = useCallback(
    ({ queryKey }) => {
      const [, walletAddress] = queryKey;
      if (!walletAddress) return;
      return api.getMempoolTransactions(walletAddress);
    },
    [api]
  );
  const { data: mempoolTxs = [], refetch } = useQuery(
    [ApiResource.Mempool, address],
    mempoolFetcher
  );

  const outboundMempoolTxs = mempoolTxs
    .filter(tx => tx.sender_address === address)
    .filter(tx => tx.nonce >= nonce);

  return { mempoolTxs, outboundMempoolTxs, refetch };
}
