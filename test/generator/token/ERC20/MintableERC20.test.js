const { BN, ether, expectRevert } = require('@openzeppelin/test-helpers')

const { shouldBehaveLikeOwnable } = require('eth-token-recover/test/access/Ownable.behavior')

const { shouldBehaveLikeERC20 } = require('./behaviours/ERC20.behaviour')
const { shouldBehaveLikeERC20Capped } = require('./behaviours/ERC20Capped.behaviour')
const { shouldBehaveLikeERC20Mintable } = require('./behaviours/ERC20Mintable.behaviour')

const MintableERC20 = artifacts.require('MintableERC20')
const ServiceReceiver = artifacts.require('ServiceReceiver')

contract('MintableERC20', function ([owner, other, thirdParty]) {
  let receiver
  const _name = 'MintableERC20'
  const _symbol = 'ERC20'
  const _decimals = new BN(8)
  const _cap = new BN(200000000)
  const _initialSupply = new BN(100000000)

  const fee = ether('0.1')

  beforeEach(async function () {
    receiver = await ServiceReceiver.new({ from: owner })
    await receiver.setPrice('MintableERC20', fee)
  })

  context('creating valid token', function () {
    describe('as a ERC20Capped', function () {
      it('requires a non-zero cap', async function () {
        await expectRevert(
          MintableERC20.new(_name, _symbol, _decimals, 0, _initialSupply, receiver.address, {
            from: owner,
            value: fee
          }),
          'ERC20Capped: cap is 0'
        )
      })
    })

    describe('as a MintableERC20', function () {
      describe('without initial supply', function () {
        beforeEach(async function () {
          this.token = await MintableERC20.new(_name, _symbol, _decimals, _cap, 0, receiver.address, {
            from: owner,
            value: fee
          })
        })

        describe('once deployed', function () {
          it('total supply should be equal to zero', async function () {
            (await this.token.totalSupply()).should.be.bignumber.equal(new BN(0))
          })

          it('owner balance should be equal to zero', async function () {
            (await this.token.balanceOf(owner)).should.be.bignumber.equal(new BN(0))
          })
        })
      })

      describe('with initial supply', function () {
        beforeEach(async function () {
          this.token = await MintableERC20.new(_name, _symbol, _decimals, _cap, _initialSupply, receiver.address, {
            from: owner,
            value: fee
          })
        })

        describe('once deployed', function () {
          it('total supply should be equal to initial supply', async function () {
            (await this.token.totalSupply()).should.be.bignumber.equal(_initialSupply)
          })

          it('owner balance should be equal to initial supply', async function () {
            (await this.token.balanceOf(owner)).should.be.bignumber.equal(_initialSupply)
          })
        })
      })
    })
  })

  context('MintableERC20 token behaviours', function () {
    beforeEach(async function () {
      this.token = await MintableERC20.new(_name, _symbol, _decimals, _cap, 0, receiver.address, {
        from: owner,
        value: fee
      })
    })

    context('like a ERC20', function () {
      beforeEach(async function () {
        await this.token.mint(owner, _initialSupply, { from: owner })
      })

      shouldBehaveLikeERC20(_name, _symbol, _decimals, _initialSupply, [owner, other, thirdParty])
    })

    context('like a ERC20Capped', function () {
      shouldBehaveLikeERC20Capped(_cap, [owner, other])
    })

    context('like a ERC20Mintable', function () {
      const zeroBalance = new BN(0)
      shouldBehaveLikeERC20Mintable(zeroBalance, [owner, thirdParty])
    })

    context('like a MintableERC20', function () {
      describe('when the sender doesn\'t have minting permission', function () {
        const from = thirdParty

        it('cannot mint', async function () {
          const amount = new BN(50)

          await expectRevert(
            this.token.mint(thirdParty, amount, { from }),
            'Ownable: caller is not the owner'
          )
        });

        it('cannot finish minting', async function () {
          await expectRevert(
            this.token.finishMinting({ from }),
            'Ownable: caller is not the owner'
          )
        })
      })
    })

    context('like a Ownable', function () {
      beforeEach(async function () {
        this.ownable = this.token
      })

      shouldBehaveLikeOwnable(owner, [thirdParty])
    })
  })
})
