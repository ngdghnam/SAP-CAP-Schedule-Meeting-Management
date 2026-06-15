

export const meetingsFilterConfig: any[] = [
    {
        key: 'title',
        label: 'Meeting Title',
        type: 'text',
        placeholder: 'Search by title...',
    },
    {
        key: 'status_code',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'SCHEDULED',   label: 'Scheduled' },
            { value: 'IN_PROGRESS',  label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
        ],
    },
    {
        key: 'isOnline',
        label: 'Type',
        type: 'select',
        options: [
            { value: 'true', label: 'Online' },
            { value: 'false', label: 'In Person' },
        ],
    },
];
