const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingPlatform", function () {
  let votingPlatform;
  let owner, voter1, voter2, unauthorized;
  let subscriptionCode = "SUBSCRIPTION123";
  let confirmationCode = "123456"; // just a placeholder used in vote(...)

  beforeEach(async function () {
    [owner, voter1, voter2, unauthorized] = await ethers.getSigners();

    const VotingPlatformFactory = await ethers.getContractFactory("VotingPlatform");
    // Deploy with a subscription code
    votingPlatform = await VotingPlatformFactory.deploy(subscriptionCode);
    await votingPlatform.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await votingPlatform.subscriptionCode()).to.equal(subscriptionCode);
  });

  it("Should allow the owner to create a public voting", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600; // 1 hour in the future

    const tx = await votingPlatform.createVoting(
      "Public Voting",
      true,   // isPublic
      false,  // isEducational
      false,  // hasNFT
      endTime,
      [],     // allowedEmails
      subscriptionCode
    );
    await tx.wait();

    // We can check some info if we want
    const [name, isPublic, isEducational, hasNFT, storedEndTime, isEnded] =
      await votingPlatform.getVotingInfo(1);

    expect(name).to.equal("Public Voting");
    expect(isPublic).to.be.true;
    expect(isEducational).to.be.false;
    expect(hasNFT).to.be.false;
    expect(isEnded).to.be.false;
    expect(storedEndTime).to.equal(BigInt(endTime));
  });

  it("Should prevent non-owners from creating a voting", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    await expect(
      votingPlatform.connect(voter1).createVoting(
        "Unauthorized Voting",
        true,
        false,
        false,
        endTime,
        [],
        subscriptionCode
      )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow voting creation with an invalid subscription code", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    await expect(
      votingPlatform.createVoting(
        "Invalid Subscription",
        true,
        false,
        false,
        endTime,
        [],
        "WRONGCODE"
      )
    ).to.be.revertedWith("Invalid subscription code");
  });

  it("Should allow the owner to create private educational voting", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    const allowedEmails = ["student1@school.edu", "student2@school.edu"];
    const tx = await votingPlatform.createVoting(
      "Private Edu Voting",
      false,  // isPublic
      true,   // isEducational
      false,  // hasNFT
      endTime,
      allowedEmails,
      subscriptionCode
    );
    await tx.wait();

    const [name, isPublic, isEducational, hasNFT, storedEndTime, isEnded, emailCount] =
      await votingPlatform.getVotingInfo(1);

    expect(name).to.equal("Private Edu Voting");
    expect(isPublic).to.be.false;
    expect(isEducational).to.be.true;
    expect(hasNFT).to.be.false;
    expect(storedEndTime).to.equal(BigInt(endTime));
    expect(isEnded).to.be.false;
    expect(emailCount).to.equal(2n);
  });

  it("Should prevent unauthorized users from voting in private voting", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    const allowedEmails = ["student1@school.edu"];
    await votingPlatform.createVoting(
      "Private Edu Voting",
      false,
      true,
      false,
      endTime,
      allowedEmails,
      subscriptionCode
    );

    await expect(
      votingPlatform.connect(voter1).vote(1, 1, "unknown@random.com", confirmationCode)
    ).to.be.revertedWith("Email not allowed to vote");
  });

  it("Should allow a whitelisted user to vote in private voting with correct code", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    const allowedEmails = ["student1@school.edu"];
    await votingPlatform.createVoting(
      "Private Edu Voting",
      false,
      true,
      true, // hasNFT = true, so we can check balanceOf
      endTime,
      allowedEmails,
      subscriptionCode
    );

    await votingPlatform
      .connect(voter1)
      .vote(1, 1, "student1@school.edu", confirmationCode);

    // Because hasNFT = true, the user gets an ERC1155 token with ID=1
    const balance = await votingPlatform.balanceOf(voter1.address, 1);
    expect(balance).to.equal(1n);
  });

  it("Should prevent users from voting twice", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 3600;

    const allowedEmails = ["student1@school.edu"];
    await votingPlatform.createVoting(
      "Double Vote Test",
      false,
      true,
      false,
      endTime,
      allowedEmails,
      subscriptionCode
    );

    // First vote
    await votingPlatform
      .connect(voter1)
      .vote(1, 1, "student1@school.edu", confirmationCode);

    // Second vote from the same user
    await expect(
      votingPlatform.connect(voter1).vote(1, 2, "student1@school.edu", confirmationCode)
    ).to.be.revertedWith("Already voted");
  });

  it("Should prevent voting after the end time", async function () {
    // We'll set endTime to +60 seconds
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 60;

    await votingPlatform.createVoting(
      "Test Voting",
      true,
      false,
      false,
      endTime,
      [],
      subscriptionCode
    );

    // Move time forward by 70s so we pass endTime
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine", []);

    // Now it should revert with "Voting has ended"
    await expect(
      votingPlatform.connect(voter1).vote(1, 1, "", "")
    ).to.be.revertedWith("Voting has ended");
  });

  it("Should allow the owner to end a voting", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 60;

    await votingPlatform.createVoting(
      "Public Voting",
      true,
      false,
      false,
      endTime,
      [],
      subscriptionCode
    );

    // Increase time by 70s so endTime is expired
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine", []);

    // Now the owner can call endVoting
    await votingPlatform.endVoting(1);
    const [name, isPublic, isEducational, hasNFT, storedEndTime, isEnded] =
      await votingPlatform.getVotingInfo(1);

    expect(isEnded).to.be.true;
  });

  it("Should return correct voting results after voting ends", async function () {
    const currentBlock = await ethers.provider.getBlock("latest");
    const endTime = currentBlock.timestamp + 60;

    await votingPlatform.createVoting(
      "Public Voting",
      true,
      false,
      false,
      endTime,
      [],
      subscriptionCode
    );

    // Voter1 votes option1, Voter2 votes option2
    await votingPlatform.connect(voter1).vote(1, 1, "", "");
    await votingPlatform.connect(voter2).vote(1, 2, "", "");

    // Move time so we can end it
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine", []);

    await votingPlatform.endVoting(1);

    // Now check results
    const results = await votingPlatform.getVotingResults(1);
    // results[0] => option1Votes, results[1] => option2Votes
    expect(results[0]).to.equal(1n);
    expect(results[1]).to.equal(1n);
  });
});
