import { IUser } from "../models/User.models";

/**
 * Utility functions for safely accessing user fields
 * These functions ensure backward compatibility with existing users
 */

/**
 * Safely get Twitter follow reward status
 * Returns false for existing users who don't have this field
 */
export function getTwitterFollowRewarded(user: IUser): boolean {
  return user.twitterFollowRewarded ?? false;
}

/**
 * Safely get Twitter follow reward date
 * Returns undefined for users who haven't claimed the reward
 */
export function getTwitterFollowRewardedAt(user: IUser): Date | undefined {
  return user.twitterFollowRewardedAt;
}

/**
 * Safely get Twitter connection status
 * Returns false if Twitter task hasn't been started
 */
export function isTwitterConnected(user: IUser): boolean {
  return !!user.twitterTaskStartedAt;
}

/**
 * Safely get Twitter task start time
 * Returns undefined if not started
 */
export function getTwitterTaskStartedAt(user: IUser): Date | undefined {
  return user.twitterTaskStartedAt;
}

/**
 * Get all Twitter-related fields safely
 * Returns an object with all Twitter fields, using defaults for missing ones
 */
export function getTwitterFields(user: IUser) {
  return {
    twitterTaskStartedAt: user.twitterTaskStartedAt,
    twitterFollowRewarded: getTwitterFollowRewarded(user),
    twitterFollowRewardedAt: user.twitterFollowRewardedAt,
    isConnected: isTwitterConnected(user),
  };
}

/**
 * Check if user has completed any Twitter tasks
 */
export function hasCompletedTwitterTasks(user: IUser): boolean {
  return getTwitterFollowRewarded(user);
}

/**
 * Get Twitter task completion summary
 */
export function getTwitterTaskSummary(user: IUser) {
  return {
    connected: isTwitterConnected(user),
    followRewarded: getTwitterFollowRewarded(user),
    followRewardedAt: getTwitterFollowRewardedAt(user),
    taskStartedAt: getTwitterTaskStartedAt(user),
  };
}
