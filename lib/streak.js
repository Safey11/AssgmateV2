export function calculateStreak(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastActiveDate) {
    return { currentStreak: 1, longestStreak: 1, lastActiveDate: today };
  }

  const lastActive = new Date(user.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, no change
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
    };
  } else if (diffDays === 1) {
    // Consecutive day - increase streak
    const newStreak = user.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveDate: today,
    };
  } else {
    // Streak broken - reset to 1
    return {
      currentStreak: 1,
      longestStreak: user.longestStreak,
      lastActiveDate: today,
    };
  }
}