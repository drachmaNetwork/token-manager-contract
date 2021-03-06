// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../../service/ServicePayer.sol";
import "../../utils/GeneratorCopyright.sol";

/**
 * @title SimpleERC20
 * @author Funit Labs (https://github.com/drachmaNetwork/token-manager-contract)
 * @dev Implementation of the SimpleERC20
 */
contract SimpleERC20 is ERC20, ServicePayer, GeneratorCopyright("v1.0.0") {
  constructor (
    string memory name,
    string memory symbol,
    uint256 initialBalance,
    address payable feeReceiver
  )
    ERC20(name, symbol)
    ServicePayer(feeReceiver, "SimpleERC20")
    payable
  {
    require(initialBalance > 0, "SimpleERC20: supply cannot be zero");

    _mint(_msgSender(), initialBalance);
  }
}