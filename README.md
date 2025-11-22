# Close Token Accounts on Gorbagana
### Without the 15% <a href="https://gor-incinerator.fun/">Gor Incinerator</a> Fee (0 fee with the program)

This program creates a transaction that closes 14 token accounts at once <u>in one transaction</u> on the **Gorbagana** blockchain.


14 is the highest number of token accounts to burn while ensuring the transaction has >90% success rate


To prevent accidental loss, this program only closes token accounts with 0 tokens in them.


To run:
Create a .env file with these contents
```dotenv
RPC_URL=... #your Gorbagana RPC url to use
WALLET=[...] #wallet whose token accounts to close, *uint8 bytes array format*
```
Then execute
`npm run burn`

The program will respond with `14 token accounts successfully closed` if the transaction succeeded.


If the program doesn't respond in 60 seconds, your transaction failed. Restart the program.


Restart the program to keep closing token accounts for massive GOR gains.


*Note: Blacklist token addresses you don't want closed in `burn.ts`

---

## About Gorbagana

Gorbagana is a high-performance blockchain fork of Solana, designed for speed, efficiency, and scalability. The Gor Incinerator helps you reclaim rent from empty token accounts on the Gorbagana network.
