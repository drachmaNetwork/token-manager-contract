// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title GeneratorCopyright
 * @author Funit Labs (https://github.com/drachmaNetwork/token-manager-contract)
 * @dev Implementation of the GeneratorCopyright
 */

 contract GeneratorCopyright {
   string private constant _GENERATOR = "Drachma by Funit Labs";
   string private _version;

  constructor (string memory version_) {
    _version = version_;
  }


  /**
  * @dev Returns the token generator tool.
  */
  function generator() public pure returns (string memory) {
    return _GENERATOR;
  }

  /**
  * @dev Returns the token generator tool.
  */
  function version() public view returns (string memory) {
    return _version;
  }
 }