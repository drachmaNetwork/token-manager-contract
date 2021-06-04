const { balance, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

const { expect } = require('chai')
const should = require('chai').should()

const { shouldBehaveLikeTokenRecover } = require('eth-token-recover/test/TokenRecover.behaviour')

const ServiceReceiver = artifacts.require('ServiceReceiver')

contract('ServiceReceiver', function ([owner, thirdParty]) {
  let receiver
  const fee = ether('0.1')

  context('ServiceReceiver behaviours', function () {
    beforeEach(async function () {
      receiver = await ServiceReceiver.new({ from: owner })
    })

    describe('set price', function () {
      context('when the sender is owner', function () {
        it('should set price', async function () {
          await receiver.setPrice('ServiceMock', fee, { from: owner })

          const receiverPrice = await receiver.getPrice('ServiceMock')

          expect(receiverPrice.toString()).to.eq(fee.toString())
        })
      })

      context('when the sender is not owner', function () {
        it('reverts', async function () {
          await expectRevert(
            receiver.setPrice('ServiceMock', fee, { from: thirdParty }),
            'Ownable: caller is not the owner'
          )
        })
      })
    })

    describe('pay', function () {
      context('with incorrect price', function () {
        it('reverts', async function () {
          await receiver.setPrice('ServiceMock', fee, { from: owner })

          await expectRevert(
            receiver.pay('ServiceMock', {
              from: thirdParty,
              value: fee.add(ether('1'))
            }),
            'ServiceReceiver: incorrect price'
          )
        })
      })

      context('with correct price', function () {
        beforeEach(async function () {
          await receiver.setPrice('ServiceMock', fee, { from: owner })
        })

        it('emits a Created event', async function () {
          const { logs } = await receiver.pay('ServiceMock', { value: fee, from: thirdParty })

          expectEvent.inLogs(logs, 'Created', {
            serviceName: 'ServiceMock',
            serviceAddress: thirdParty,
          })
        })

        it('transfer fee to receiver', async function () {
          const initBalance = await balance.current(receiver.address)

          await receiver.pay('ServiceMock', { value: fee, from: thirdParty })

          const newBalance = await balance.current(receiver.address)

          expect(newBalance).to.be.bignumber.equal(initBalance.add(fee))
        })
      })
    })

    describe('withdraw', function () {
      beforeEach(async function () {
        await receiver.setPrice('ServiceMock', fee, { from: owner })
        await receiver.pay('ServiceMock', { value: fee, from: thirdParty })
      })

      context('when the sender is owner', function () {
        it('should withdraw', async function () {
          const amount = ether('0.05')

          const contractBalanceTracker = await balance.tracker(receiver.address)
          const ownerBalanceTracker = await balance.tracker(owner)

          await receiver.withdraw(amount, { from: owner, gasPrice: 0 })

          expect(await contractBalanceTracker.delta()).to.be.bignumber.equal(amount.neg())
          expect(await ownerBalanceTracker.delta()).to.be.bignumber.equal(amount)
        })
      })

      context('when the sender is not owner', function () {
        it('reverts', async function () {
          const amount = ether('0.05')

          await expectRevert(
            receiver.withdraw(amount, { from: thirdParty }),
            'Ownable: caller is not the owner'
          )
        })
      })

      context('like a TokenRecover', function () {
        beforeEach(async function () {
          this.instance = receiver
        })

        shouldBehaveLikeTokenRecover([owner, thirdParty])
      })
    })
  })
})