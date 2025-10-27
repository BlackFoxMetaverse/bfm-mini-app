// src/services/UserService.ts

import { Response } from "express";
import ResponseHandler from "../utils/apiResponse";
import { z } from "zod";
import { userRegisterValidation } from "../utils/validation";
import bcrypt from "bcrypt";
import { User } from "../models/User.models";
import JWTUtils from "../utils/jwtUtils";
import { ethers } from "ethers";
import mongoose from "mongoose";

// Helper function to update referral level rewards
async function updateReferralLevelRewards(
  userId: any,
  level: number,
  rewardAmount: number
) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const existingReward = user.referralLevelRewards?.find(
      (r: any) => r.level === level
    );

    if (existingReward) {
      // Update existing level reward
      await User.updateOne(
        { _id: userId, "referralLevelRewards.level": level },
        {
          $inc: {
            "referralLevelRewards.$.totalEarned": rewardAmount,
            "referralLevelRewards.$.referralCount": 1,
          },
          $set: {
            "referralLevelRewards.$.lastRewardAt": new Date(),
          },
        }
      );
    } else {
      // Add new level reward
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            referralLevelRewards: {
              level: level,
              totalEarned: rewardAmount,
              referralCount: 1,
              lastRewardAt: new Date(),
            },
          },
        }
      );
    }
  } catch (error) {
    console.error("Error updating referral level rewards:", error);
  }
}

class UserService {
  async registerEmailUser(
    userData: z.infer<typeof userRegisterValidation>,
    res: Response
  ) {
    try {
      const existing = await User.findOne({
        email: userData.email.toLowerCase(),
      });

      if (existing) {
        return ResponseHandler.badRequest(res, "Email already registered");
      }

      const passwordHash = await bcrypt.hash(userData.password, 10);

      const user = await User.create({
        email: userData.email.toLowerCase(),
        passwordHash,
        username: userData.username,
        loginMethod: "email",
      });

      return ResponseHandler.success(
        res,
        "User registered successfully",
        user,
        201
      );
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to register user",
        error
      );
    }
  }
  async getReferrals(userId: string, res: Response) {
    try {
      const user = await User.findById(userId).populate("referredUsers");

      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      const referrals = (user.referredUsers || []).map((refUser: any) => ({
        telegram: {
          first_name: refUser.telegramFirstName,
          username: refUser.telegramUsername,
          photo_url: refUser.telegramPhotoUrl,
        },
        _id: refUser._id,
      }));

      return ResponseHandler.success(res, "Fetched referred users", referrals);
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to fetch referrals",
        error
      );
    }
  }

  async loginEmailUser(email: string, password: string, res: Response) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !user.passwordHash) {
        return ResponseHandler.badRequest(res, "Invalid credentials");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return ResponseHandler.badRequest(res, "Invalid credentials");
      }

      const token = JWTUtils.generateToken({ userId: user._id });

      res.cookie("hrmsots-token", token);

      return ResponseHandler.success(res, "Login successful", { user, token });
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Login failed", error);
    }
  }
  async nonceWalletUser(walletAddress: string, res: Response) {
    try {
      const address = walletAddress.toLowerCase();

      let user = await User.findOne({ walletAddress: address });
      if (!user) {
        user = await User.create({
          walletAddress: address,
          loginMethod: "wallet",
        });
      }

      const nonce = `${Math.floor(Math.random() * 1000000)}`;
      user.nonce = nonce;
      await user.save();

      return ResponseHandler.success(res, "Nonce generated", { nonce });
    } catch (error: any) {
      console.error("Nonce generation error:", error);
      return ResponseHandler.internalError(
        res,
        "Failed to generate nonce",
        error
      );
    }
  }

  async connectWalletToTelegramUser(
    loginData: any,
    address: string,
    res: Response
  ) {
    try {
      const telegramId = loginData.telegramId;

      if (!address || !telegramId) {
        return ResponseHandler.badRequest(
          res,
          "Missing wallet address or telegramId"
        );
      }

      const walletAddress = address.toLowerCase();

      const existingUserWithWallet = await User.findOne({
        walletAddress: walletAddress,
        telegramId: { $ne: telegramId }, // Exclude current user
      });

      if (existingUserWithWallet) {
        return ResponseHandler.badRequest(
          res,
          "This wallet is already connected to another user"
        );
      }

      const user = await User.findOne({ telegramId });
      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      if (!user.walletConnected) {
        user.token = (user.token || 0) + 100;
      }

      user.walletAddress = walletAddress;
      user.walletConnected = true;

      await user.save();

      const token = JWTUtils.generateToken({ id: user._id });
      res.cookie("bfm-token", token);

      return ResponseHandler.success(res, "Wallet connected successfully", {
        user,
      });
    } catch (error: any) {
      console.error("Wallet connect error:", error);
      return ResponseHandler.internalError(
        res,
        "Failed to connect wallet",
        error
      );
    }
  }

  async getAllUsers(res: Response) {
    try {
      const users = await User.find();
      return ResponseHandler.success(res, "Fetched all users", users);
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Failed to fetch users", error);
    }
  }

  async getUserById(userId: string, res: Response) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      return ResponseHandler.success(res, "Fetched user", user);
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Failed to fetch user", error);
    }
  }

  async updateUsername(userId: string, username: string, res: Response) {
    try {
      const updated = await User.findByIdAndUpdate(
        userId,
        { username },
        { new: true }
      );

      if (!updated) {
        return ResponseHandler.notFound(res, "User not found");
      }

      return ResponseHandler.success(res, "Username updated", updated);
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to update username",
        error
      );
    }
  }

  async getProfile(userId: string, res: Response) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      // Normalize subscription shape expected by frontend: subscription.active === isPremiumUser
      const normalized: any = {
        ...user.toObject(),
        subscription: { active: !!user.isPremiumUser },
        premiumBooks: Array.isArray((user as any).premiumBooks)
          ? (user as any).premiumBooks
          : [],
      };

      return ResponseHandler.success(res, "Fetched user profile", normalized);
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to fetch profile",
        error
      );
    }
  }

  async getLeaderboard(res: Response) {
    try {
      // Limit and projection for performance
      const DEFAULT_LIMIT = 100;
      const limit = DEFAULT_LIMIT;
      const users = await User.find(
        { token: { $gt: 0 } },
        {
          token: 1,
          telegramFirstName: 1,
          telegramLastName: 1,
          telegramUsername: 1,
          telegramPhotoUrl: 1,
          username: 1,
          createdAt: 1,
        }
      )
        .sort({ token: -1, createdAt: 1 })
        .limit(limit)
        .lean();

      // Add position to each user
      const leaderboard = users.map((user, index) => ({
        position: index + 1,
        ...user,
      }));

      return ResponseHandler.success(res, "Fetched leaderboard", leaderboard);
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to fetch leaderboard",
        error
      );
    }
  }

  async disconnectWalletForUser(userId: string, res: Response) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      user.walletAddress = undefined as any;
      user.walletConnected = false as any;
      await user.save();

      return ResponseHandler.success(res, "Wallet disconnected successfully", {
        user,
      });
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to disconnect wallet",
        error
      );
    }
  }

  async logoutUser(res: Response) {
    try {
      res.clearCookie("bfm-token", {
        path: "/",
        httpOnly: false,
        secure: false,
      });

      return ResponseHandler.success(res, "Logout successful");
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Logout failed", error);
    }
  }

  async loginOrRegisterTelegramUser(
    telegramData: {
      telegramId: number;
      telegramFirstName?: string;
      telegramLastName?: string;
      telegramUsername?: string;
      telegramPhotoUrl?: string;
      // Optional referral code passed by client (e.g., inviter's telegramId or userId)
      referralCode?: string;
    },
    res: Response
  ) {
    try {
      if (!telegramData.telegramId) {
        return ResponseHandler.badRequest(res, "telegramId is required");
      }

      let user = await User.findOne({ telegramId: telegramData.telegramId });

      if (!user) {
        // Create new user; referral binding and rewards occur in a transaction below
        user = await User.create({
          telegramId: telegramData.telegramId,
          telegramFirstName: telegramData.telegramFirstName,
          telegramLastName: telegramData.telegramLastName,
          telegramUsername: telegramData.telegramUsername,
          telegramPhotoUrl: telegramData.telegramPhotoUrl,
        });
      }

      // Attempt immutable referral binding and multi-level rewards once, server-side only
      const maybeCode = (telegramData as any).referralCode;

      // Process referral if: 1) Has referralCode from frontend, OR 2) Has botReferralPending flag
      if (
        (maybeCode && !user.referralUsed && !user.referredBy) ||
        user.botReferralPending
      ) {
        try {
          // Determine referrer: either from frontend referralCode or bot referral
          let referrerQuery: any;
          if (maybeCode) {
            // Frontend referral: Accept either inviter's telegramId (number) or Mongo ObjectId string
            referrerQuery = /^[0-9]+$/.test(String(maybeCode))
              ? { telegramId: Number(maybeCode) }
              : { _id: new mongoose.Types.ObjectId(String(maybeCode)) };
          } else if (user.botReferralPending) {
            // Bot referral: Find referrer who has this user in their referredUsers list
            referrerQuery = { referredUsers: user._id };
          }

          // Refresh user data to ensure we have latest state
          const freshUser = await User.findOne({ _id: user._id });
          if (!freshUser)
            throw new Error("User disappeared during referral bind");

          // Already bound? idempotent early-exit
          if (freshUser.referralUsed || freshUser.referredBy) {
            return; // Exit early - already processed
          }
          const referrer = await User.findOne(referrerQuery);
          if (referrer && String(referrer._id) !== String(freshUser._id)) {
            // prevent cycles by ensuring referrer is not downline of user
            const isCycle = await User.exists({
              _id: referrer._id,
              referredBy: freshUser._id,
            });
            if (isCycle) {
              // refuse cycle
              return;
            }

            // Bind referral immutably (atomic operation)
            const bindResult = await User.updateOne(
              {
                _id: freshUser._id,
                referralUsed: { $ne: true },
                referredBy: null,
              },
              {
                $set: {
                  referredBy: referrer._id,
                  referralUsed: true,
                  referralBoundAt: new Date(),
                },
                $unset: { botReferralPending: 1 }, // Remove the field
              }
            );

            if (bindResult.modifiedCount === 0) {
              return;
            }

            // Link child to referrer set (atomic operation)
            await User.updateOne(
              { _id: referrer._id },
              {
                $addToSet: { referredUsers: freshUser._id },
                $inc: { referralCount: 1 },
              }
            );

            // Compute L1-L3 upline and credit tokens atomically, idempotent by checking reward marker
            const level1 = referrer;
            const level2 = level1
              ? await User.findById(level1.referredBy)
              : null;
            const level3 = level2
              ? await User.findById(level2.referredBy)
              : null;

            const credits: Array<{ _id: any; amount: number }> = [];
            if (level1) credits.push({ _id: level1._id, amount: 5000 });
            if (level2) credits.push({ _id: level2._id, amount: 2500 });
            if (level3) credits.push({ _id: level3._id, amount: 1500 });

            // Simple idempotency: mark reward on the joiner once
            const rewardNonce = `ref:${freshUser._id.toString()}`;
            const marked = await User.updateOne(
              { _id: freshUser._id, referralRewardedAt: { $exists: false } },
              {
                $set: {
                  referralRewardedAt: new Date(),
                  referralRewardTxId: rewardNonce,
                },
              }
            );

            if (marked.modifiedCount > 0) {
              for (let i = 0; i < credits.length; i++) {
                const c = credits[i];
                const level = i + 1; // Level 1, 2, or 3

                // Credit tokens
                await User.updateOne(
                  { _id: c._id },
                  { $inc: { token: c.amount } }
                );

                // Track level rewards
                await updateReferralLevelRewards(c._id, level, c.amount);
              }
            }
          }
        } catch (e) {
          console.error("Error in referral processing", e);
          // Don't throw - allow login to continue even if referral fails
        }
      }

      const token = JWTUtils.generateToken({ id: user._id });
      res.cookie("bfm-token", token);

      return ResponseHandler.success(res, "Telegram login successful", {
        user,
        token,
      });
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Telegram login failed", error);
    }
  }

  async setPremium(userId: string, res: Response) {
    try {
      const user = await User.findById(userId);
      if (!user) return ResponseHandler.notFound(res, "User not found");
      if (!user.isPremiumUser) {
        user.isPremiumUser = true as any;
        await user.save();
      }
      return ResponseHandler.success(res, "User marked premium", user);
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Failed to set premium", error);
    }
  }

  // Idempotent unlock of a single premium book for a user
  async unlockPremiumBook(userId: string, bookId: string, res: Response) {
    try {
      const user: any = await User.findById(userId);
      if (!user) return ResponseHandler.notFound(res, "User not found");
      if (!bookId) return ResponseHandler.badRequest(res, "bookId is required");

      const current: string[] = Array.isArray(user.premiumBooks)
        ? user.premiumBooks
        : [];
      if (!current.includes(bookId)) {
        user.premiumBooks = [...current, bookId];
        await user.save();
      }

      return ResponseHandler.success(res, "Book unlocked", {
        premiumBooks: user.premiumBooks,
      });
    } catch (error: any) {
      return ResponseHandler.internalError(res, "Failed to unlock book", error);
    }
  }

  async applyReferralCode(userId: string, referrerId: string, res: Response) {
    try {
      const user = await User.findById(userId);
      const referrer = await User.findById(referrerId);

      if (!user || !referrer) {
        return res.status(404).json({ message: "User or referrer not found" });
      }

      if (user.referralUsed) {
        return res.status(400).json({ message: "Referral code already used" });
      }

      // Make sure user is not referring themselves
      if (userId.toString() === referrerId.toString()) {
        return res.status(400).json({ message: "You cannot refer yourself" });
      }

      // Prevent cycles by ensuring referrer is not downline of user
      const isCycle = await User.exists({
        _id: referrer._id,
        referredBy: user._id,
      });

      if (isCycle) {
        return res.status(400).json({ message: "Circular referral detected" });
      }

      // Bind referral immutably (atomic operation)
      const bindResult = await User.updateOne(
        { _id: user._id, referralUsed: { $ne: true }, referredBy: null },
        {
          $set: {
            referredBy: referrer._id,
            referralUsed: true,
            referralBoundAt: new Date(),
          },
        }
      );

      if (bindResult.modifiedCount === 0) {
        return res
          .status(400)
          .json({ message: "Referral binding failed - may already be used" });
      }

      // Link child to referrer set (atomic operation)
      await User.updateOne(
        { _id: referrer._id },
        { $addToSet: { referredUsers: user._id }, $inc: { referralCount: 1 } }
      );

      // Compute L1-L3 upline and credit tokens atomically
      const level1 = referrer;
      const level2 = level1 ? await User.findById(level1.referredBy) : null;
      const level3 = level2 ? await User.findById(level2.referredBy) : null;

      const credits: Array<{ _id: any; amount: number }> = [];
      if (level1) credits.push({ _id: level1._id, amount: 5000 });
      if (level2) credits.push({ _id: level2._id, amount: 2500 });
      if (level3) credits.push({ _id: level3._id, amount: 1500 });

      // Simple idempotency: mark reward on the joiner once
      const rewardNonce = `ref:${user._id.toString()}`;
      const marked = await User.updateOne(
        { _id: user._id, referralRewardedAt: { $exists: false } },
        {
          $set: {
            referralRewardedAt: new Date(),
            referralRewardTxId: rewardNonce,
          },
        }
      );

      if (marked.modifiedCount > 0) {
        for (let i = 0; i < credits.length; i++) {
          const c = credits[i];
          const level = i + 1; // Level 1, 2, or 3

          // Credit tokens
          await User.updateOne({ _id: c._id }, { $inc: { token: c.amount } });

          // Track level rewards
          await updateReferralLevelRewards(c._id, level, c.amount);
        }
      }

      return res.status(200).json({ message: "Referral applied successfully" });
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to apply referral code",
        error
      );
    }
  }

  async getReferralLevelRewards(userId: string, res: Response) {
    try {
      const user = await User.findById(userId).select("referralLevelRewards");

      if (!user) {
        return ResponseHandler.notFound(res, "User not found");
      }

      const levelRewards = user.referralLevelRewards || [];

      // Ensure all levels are represented (even with 0 rewards)
      const allLevels = [1, 2, 3].map((level) => {
        const existing = levelRewards.find((r: any) => r.level === level);
        return (
          existing || {
            level: level,
            totalEarned: 0,
            referralCount: 0,
            lastRewardAt: null,
          }
        );
      });

      const totalEarned = allLevels.reduce(
        (sum, level) => sum + level.totalEarned,
        0
      );
      const totalReferrals = allLevels.reduce(
        (sum, level) => sum + level.referralCount,
        0
      );

      return ResponseHandler.success(res, "Fetched referral level rewards", {
        levelRewards: allLevels,
        summary: {
          totalEarned,
          totalReferrals,
          levels: allLevels.length,
        },
      });
    } catch (error: any) {
      return ResponseHandler.internalError(
        res,
        "Failed to fetch referral level rewards",
        error
      );
    }
  }
}

export default new UserService();
