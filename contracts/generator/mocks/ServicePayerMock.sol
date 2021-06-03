// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../service/ServicePayer.sol";

// mock class using ServicePayer
contract ServicePayerMock is ServicePayer {
  constructor (address payable feeReceiver) ServicePayer(feeReceiver, "ServicePayerMock") payable {}
}