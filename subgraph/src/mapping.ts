import { BigInt, log } from "@graphprotocol/graph-ts";
import { Invested as InvestedEvent, YieldDistributed as YieldDistributedEvent } from "../generated/RWAPrivateCredit/RWAPrivateCredit";
import { Pool, Investment, YieldDistribution } from "../generated/schema";

export function handleInvested(event: InvestedEvent): void {
  const poolId = "default-pool";
  let pool = Pool.load(poolId);
  if (pool == null) {
    pool = new Pool(poolId);
    pool.totalInvested = BigInt.zero();
  }

  const investmentId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const investment = new Investment(investmentId);
  investment.pool = poolId;
  investment.investor = event.params.investor;
  investment.amount = event.params.amount;
  investment.timestamp = event.block.timestamp;
  investment.save();

  pool.totalInvested = pool.totalInvested.plus(event.params.amount);
  pool.save();
}

export function handleYieldDistributed(event: YieldDistributedEvent): void {
  const ydId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const yd = new YieldDistribution(ydId);
  yd.amount = event.params.totalAmount;
  yd.timestamp = event.params.timestamp;
  yd.save();
}


