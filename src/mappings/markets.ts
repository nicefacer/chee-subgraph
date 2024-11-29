/* eslint-disable prefer-const */ // to satisfy AS compiler

// For each division by 10, add one to exponent to truncate one significant figure
import { Address, BigDecimal, ByteArray, BigInt, log } from '@graphprotocol/graph-ts'
import { Market} from '../../generated/schema'
import { PriceOracle2 } from '../../generated/templates/CToken/PriceOracle2'
import { BEP20 } from '../../generated/templates/CToken/BEP20'
import { CToken } from '../../generated/templates/CToken/CToken'
import { Comptroller } from '../../generated/schema'



import {
  exponentToBigDecimal,
  mantissaFactor,
  mantissaFactorBD,
  cTokenDecimalsBD,
  zeroBD,
} from './helpers'

let vUSDCAddress = '0x0000000000000000000000000000000000000000'
let cCELOAddress = '0x9de4171edc1f69ead07f7595bd3bed62d9215532'

// Used for all cBEP20 contracts
function getTokenPrice(
  blockNumber: BigInt,
  eventAddress: Address,
  underlyingAddress: Address,
  underlyingDecimals: BigInt
): BigDecimal {
  let comptroller = Comptroller.load('1');
  if (comptroller == null) {
    log.error('Comptroller not found', []);
    return zeroBD;
  }

  let priceOracle = comptroller.priceOracle;
  if (!priceOracle || priceOracle.equals(ByteArray.fromHexString('0x0000000000000000000000000000000000000000'))) {
    log.error('priceOracle is null or invalid on Comptroller entity', []);
    return zeroBD; // Handle the error gracefully and return a default value
  }

  // Safely convert priceOracle (ByteArray) to Address
  let oracleAddress = Address.fromBytes(priceOracle);
  let underlyingPrice: BigDecimal;

  /* PriceOracle2 is used from the start of Comptroller.
   * This must use the cToken address.
   *
   * Note: this returns the value without factoring in token decimals and wei,
   * so we must divide the number by (bnbDecimals - tokenDecimals) and again by the mantissa.
   */
  let mantissaDecimalFactor = BigInt.fromI32(18);
  let bdFactor = exponentToBigDecimal(mantissaDecimalFactor);

  // Bind the PriceOracle2 contract
  let oracle2 = PriceOracle2.bind(oracleAddress);
  let underlyingCall = oracle2.try_getUnderlyingPrice(eventAddress);

  // Handle the call result
  if (underlyingCall.reverted) {
    log.warning('PriceOracle2 getUnderlyingPrice reverted for address: {}', [eventAddress.toHexString()]);
    underlyingPrice = zeroBD;
  } else {
    underlyingPrice = underlyingCall.value.toBigDecimal().div(bdFactor);
  }

  return underlyingPrice;
}



export function createMarket(marketAddress: string): Market {
  let market = new Market(marketAddress); // Define market early

  let contract = CToken.bind(Address.fromString(marketAddress));

  // Handle the cCELO case (special case)
  if (marketAddress == cCELOAddress) {
    market.underlyingAddress = Address.fromString(
      '0x0000000000000000000000000000000000000000',
    );
    market.underlyingDecimals = 18;
    market.underlyingPrice = BigDecimal.fromString('1');
    market.underlyingName = 'Celo Coin';
    market.underlyingSymbol = 'CELO';
    market.underlyingPriceUSD = zeroBD;
  } else {
    // Default case for other markets
    let underlyingResult = contract.try_underlying();

    if (underlyingResult.reverted) {
      // Log and handle failure gracefully
      log.error('Failed to fetch underlying token for market {}', [marketAddress]);
      market.underlyingAddress = Address.fromString('0x0000000000000000000000000000000000000000'); // Default address
    } else {
      market.underlyingAddress = underlyingResult.value;
    }

    // Ensure underlyingAddress is of type Address
    let underlyingAddress = Address.fromString(market.underlyingAddress.toHexString());

    // Bind the underlying contract for further details (such as decimals, name, etc.)
    let underlyingContract = BEP20.bind(underlyingAddress);

    let decimalsResult = underlyingContract.try_decimals();
    market.underlyingDecimals = decimalsResult.reverted ? 18 : decimalsResult.value;

    let nameResult = underlyingContract.try_name();
    market.underlyingName = nameResult.reverted ? 'Unknown' : nameResult.value;

    let symbolResult = underlyingContract.try_symbol();
    market.underlyingSymbol = symbolResult.reverted ? 'UNKNOWN' : symbolResult.value;

    // Price info
    market.underlyingPriceUSD = zeroBD;
    market.underlyingPrice = zeroBD;

    if (marketAddress == vUSDCAddress) {
      market.underlyingPriceUSD = BigDecimal.fromString('1');
    }
  }

  // Handle other market properties (interest rate model, reserve factor, etc.)
  let interestRateModelAddress = contract.try_interestRateModel();
  let reserveFactor = contract.try_reserveFactorMantissa();

  market.borrowRate = zeroBD;
  market.cash = zeroBD;
  market.collateralFactor = zeroBD;
  market.exchangeRate = zeroBD;

  market.interestRateModelAddress = interestRateModelAddress.reverted
    ? Address.fromString('0x0000000000000000000000000000000000000000')
    : interestRateModelAddress.value;

  let nameResult = contract.try_name();
  let symbolResult = contract.try_symbol();

  market.name = nameResult.reverted ? 'Unknown' : nameResult.value;
  market.symbol = symbolResult.reverted ? 'UNKNOWN' : symbolResult.value;

  market.reserves = zeroBD;
  market.supplyRate = zeroBD;
  market.totalBorrows = zeroBD;
  market.totalSupply = zeroBD;

  market.accrualBlockNumber = BigInt.zero();
  market.blockTimestamp = 0;
  market.borrowIndex = zeroBD;
  market.reserveFactor = reserveFactor.reverted ? BigInt.fromI32(0) : reserveFactor.value;

  return market;
}


function getBNBinUSD(blockNumber: BigInt): BigDecimal {
  let comptroller = Comptroller.load('1');
  if (comptroller == null) {
    log.error('Comptroller not found', []);
    return zeroBD;
  }

  // Ensure the priceOracle exists and is valid
  let priceOracle = comptroller.priceOracle;
  if (!priceOracle || priceOracle.toHexString() == '0x0000000000000000000000000000000000000000') {
    log.error('Invalid or missing priceOracle in Comptroller entity', []);
    return zeroBD;
  }

  // Convert Bytes to Address only if it's valid
  let oracleAddress = Address.fromBytes(priceOracle);

  // Bind to the PriceOracle contract using the oracleAddress
  let oracle = PriceOracle2.bind(oracleAddress);

  // Use try_* to safely fetch the price of cCELO
  let bnbPriceResult = oracle.try_getUnderlyingPrice(Address.fromString(cCELOAddress));
  if (bnbPriceResult.reverted) {
    log.error('Failed to fetch underlying price for cCELO from PriceOracle at {}', [oracleAddress.toHexString()]);
    return zeroBD;
  }

  // Calculate the price in USD
  let bnbPriceInUSD = bnbPriceResult.value.toBigDecimal().div(mantissaFactorBD);
  return bnbPriceInUSD;
}


export function updateMarket(
  marketAddress: Address,
  blockNumber: BigInt,
  blockTimestamp: BigInt,
): Market {
  let marketID = marketAddress.toHexString();
  let market = Market.load(marketID);
  if (market == null) {
    market = createMarket(marketID);
  }

  // Only update the market if it has not been updated this block
  let blockNumberBigInt = blockNumber;
  if (!market.accrualBlockNumber.equals(blockNumber)) {
    let contractAddress = Address.fromString(market.id);
    let contract = CToken.bind(contractAddress);

    let bnbPriceInUSD = getBNBinUSD(blockNumberBigInt);

    // Safely validate and convert `market.underlyingAddress`
    let underlyingAddressBytes = market.underlyingAddress;
    if (!underlyingAddressBytes || underlyingAddressBytes.toHexString() == '0x0000000000000000000000000000000000000000') {
      log.error('Invalid underlyingAddress for market: {}', [market.id]);
      return market as Market; // Early return with no further updates
    }

    let underlyingAddress = Address.fromBytes(underlyingAddressBytes);

    // Update USD price for CELO market
    if (market.id == cCELOAddress) {
      market.underlyingPriceUSD = bnbPriceInUSD.truncate(market.underlyingDecimals);
    } else {
      let tokenPriceUSD = getTokenPrice(
        blockNumberBigInt,
        contractAddress,
        underlyingAddress, // Safely converted Address
        BigInt.fromI32(market.underlyingDecimals)
      );

      market.underlyingPrice = tokenPriceUSD
        .div(bnbPriceInUSD)
        .truncate(market.underlyingDecimals);

      // Update CELO price for non-USDC markets
      if (market.id != vUSDCAddress) {
        market.underlyingPriceUSD = tokenPriceUSD.truncate(market.underlyingDecimals);
      }
    }

    market.accrualBlockNumber = contract.accrualBlockNumber();
    market.blockTimestamp = blockTimestamp.toI32();
    market.totalSupply = contract
      .totalSupply()
      .toBigDecimal()
      .div(cTokenDecimalsBD);

    market.exchangeRate = contract
      .exchangeRateStored()
      .toBigDecimal()
      .div(exponentToBigDecimal(BigInt.fromI32(market.underlyingDecimals)))
      .times(cTokenDecimalsBD)
      .div(mantissaFactorBD)
      .truncate(mantissaFactor);

    market.borrowIndex = contract
      .borrowIndex()
      .toBigDecimal()
      .div(mantissaFactorBD)
      .truncate(mantissaFactor);

    market.reserves = contract
      .totalReserves()
      .toBigDecimal()
      .div(exponentToBigDecimal(BigInt.fromI32(market.underlyingDecimals)))
      .truncate(market.underlyingDecimals);

    market.totalBorrows = contract
      .totalBorrows()
      .toBigDecimal()
      .div(exponentToBigDecimal(BigInt.fromI32(market.underlyingDecimals)))
      .truncate(market.underlyingDecimals);

    market.cash = contract
      .getCash()
      .toBigDecimal()
      .div(exponentToBigDecimal(BigInt.fromI32(market.underlyingDecimals)))
      .truncate(market.underlyingDecimals);

    market.borrowRate = contract
      .borrowRatePerBlock()
      .toBigDecimal()
      .div(mantissaFactorBD)
      .truncate(mantissaFactor);

    let supplyRatePerBlock = contract.try_supplyRatePerBlock();
    if (supplyRatePerBlock.reverted) {
      log.info('***CALL FAILED*** : cBEP20 supplyRatePerBlock() reverted', []);
      market.supplyRate = zeroBD;
    } else {
      market.supplyRate = supplyRatePerBlock.value
        .toBigDecimal()
        .div(mantissaFactorBD)
        .truncate(mantissaFactor);
    }

    market.save();
  }

  return market as Market;
}

