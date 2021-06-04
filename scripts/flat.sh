#!/usr/bin/env bash

rm -rf ./dist
mkdir dist

for contract in "SimpleERC20" "StandardERC20" "PausableERC20" "BurnableERC20" "MintableERC20" "CommonERC20" "UnlimitedERC20" "AmazingERC20" "PowerfulERC20"
do
  npx truffle-flattener contracts/generator/token/ERC20/$contract.sol > dist/$contract.dist.sol
done

npx truffle-flattener contracts/generator/service/ServiceReceiver.sol > dist/ServiceReceiver.dist.sol