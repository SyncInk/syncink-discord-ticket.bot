module.exports = {
    // Ticket System Category ID
    ticketCategoryId: '1501030668354977922',
    
    // Log Channel ID
    logChannelId: '1512529091306197113',
    
    // Role IDs that can manage tickets
    staffRoleIds: ['1512788699094585424'],
    adminRoleIds: ['1512788998928466052'],
    ownerRoleIds: ['1494137334827061258'],

    // Visual Settings
    colors: {
        primary: '#9B59B6', // Dark purple/pink gradient theme
        success: '#2ECC71',
        error: '#E74C3C',
        log: '#2C2F33'
    },

    // Ticket Options
    ticketOptions: [
        {
            label: 'General Request',
            description: 'request help with something in general',
            value: 'general_request',
            emoji: '1513319472172367992'
        },
        {
            label: 'User Report',
            description: 'report a misbehaving user to the moderators',
            value: 'user_report',
            emoji: '1513319472172367992'
        },
        {
            label: 'Bug Report',
            description: 'report a bug to the developers',
            value: 'bug_report',
            emoji: '1513328514529624185'
        },
        {
            label: 'Staff Abuse',
            description: 'report a misbehaving staff member to the admins',
            value: 'staff_abuse',
            emoji: '1513319398688034997'
        },
        {
            label: 'Other',
            description: 'something else that is not listed above',
            value: 'other_request',
            emoji: '1513328514529624185'
        },
        {
            label: 'Owner Contact',
            description: 'only for serious matters and community inquiries',
            value: 'owner_contact',
            emoji: '👑'
        }
    ],

    // Database Settings
    database: {
        // Switch to true to use MongoDB instead of SQLite
        useMongo: false
    }
};
