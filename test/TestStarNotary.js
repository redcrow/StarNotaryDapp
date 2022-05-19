const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 7777;
    await instance.createStar('My7777star', starId, {from: user1});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let ContractName = await instance.name();
    let ContractSymbol = await instance.symbol();
    let starLookUp = await instance.lookUptokenIdToStarInfo(starId);

    assert.equal(ContractName,'Crowe Notary Token');
    assert.equal(ContractSymbol,'CRW');
    assert.equal(starLookUp,'My7777star');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let starId1 = 20;
    let starId2 = 25;
    let user1 = accounts[0];
    let user2 = accounts[1];
    await instance.createStar('user1MegaStar', starId1, { from: user1 });
    await instance.createStar('user2MegaStar', starId2, { from: user2 });
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    assert.equal(user1, await instance.ownerOf(starId1));
    assert.equal(user2, await instance.ownerOf(starId2));

    await instance.exchangeStars(starId1, starId2, { from: user1 });

    // 3. Verify that the owners changed
    assert.equal(user1, await instance.ownerOf(starId2));
    assert.equal(user2, await instance.ownerOf(starId1));

});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId = 5555;
    let user1 = accounts[0];
    let user2 = accounts[1];
    await instance.createStar('owned by user1', tokenId, { from: user1 });

    // 2. use the transferStar function implemented in the Smart Contract
    assert.equal(user1, await instance.ownerOf(tokenId));

    await instance.transferStar(user2, tokenId)
    ;    
    // 3. Verify the star owner changed.
    assert.equal(user2, await instance.ownerOf(tokenId));
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId = 1000;
    let user1 = accounts[4];
    let starName = "INFAMOUS NORTHERN STAR";
    await instance.createStar(starName, tokenId, { from: user1 });
    // 2. Call your method lookUptokenIdToStarInfo
    let newStar = await instance.lookUptokenIdToStarInfo(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(newStar, starName);
});