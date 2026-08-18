# Treasure Rush Pro v2

A polished mobile-first runner prototype for GitHub Pages.

## Files
- index.html
- style.css
- game.js

## Features
- 3-lane endless runner with jump, obstacles and a pursuer
- Health system
- Multiple maps that unlock by level
- Coins, gems and score
- Spin wheel with 20/50/100 coins, 10/30/50 gems, and $0.020
- Ad gate before claiming spin rewards
- Ad gate before level-up
- Referral center
- Missions, leaderboard, profile and withdraw screens
- LocalStorage demo persistence

## Important
The ad player in this version is a DEMO countdown. Replace `demoAd()` in game.js with the real rewarded-ad SDK callback. Only credit rewards after the ad provider's verified completion/reward event.

Real referrals, balances and withdrawals must be verified server-side; never trust LocalStorage for real-money balances.
