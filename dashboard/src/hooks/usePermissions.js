import { useOutletContext } from 'react-router-dom';

const TIER_LEVELS = {
  owner: 5,
  developer: 4,
  admin: 3,
  moderator: 2,
  staff: 1,
  member: 0
};

export default function usePermissions() {
  const { selectedGuild, snapshot } = useOutletContext();
  const userTier = snapshot?.userTier || selectedGuild?.dashboardTier || (selectedGuild?.owner ? 'owner' : 'staff');

  const hasPermission = (requiredTier) => {
    return (TIER_LEVELS[userTier] || 0) >= TIER_LEVELS[requiredTier];
  };

  return {
    userTier,
    isOwner: hasPermission('owner'),
    isDeveloper: hasPermission('developer'),
    isAdmin: hasPermission('admin'),
    isModerator: hasPermission('moderator'),
    isStaff: hasPermission('staff'),

    // Specific capability flags
    canEditSettings: hasPermission('admin'),
    canEditAccess: hasPermission('developer'),
    canDeployPanel: hasPermission('admin'),
    canViewAnalytics: hasPermission('moderator'),
    canViewAudit: hasPermission('moderator'),
    canViewTranscripts: hasPermission('moderator'),
    
    // UI Helpers
    getLockTooltip: (requiredTier) => {
      if (hasPermission(requiredTier)) return null;
      switch (requiredTier) {
        case 'owner': return 'Owner permission required';
        case 'developer': return 'Developer or Owner permission required';
        case 'admin': return 'Administrator permission required';
        case 'moderator': return 'Moderator permission required';
        default: return 'Permission denied';
      }
    }
  };
}
