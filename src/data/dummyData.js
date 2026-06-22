export const DUMMY_DATA = {
  students: [
    {
      id: '1',
      name: 'Alice Johnson',
      class: '10th Grade',
      rollNumber: '101',
      email: 'alice@example.com',
      phone: '+1234567890',
      attendance: [
        { date: '2024-01-15', status: 'present' },
        { date: '2024-01-16', status: 'present' },
        { date: '2024-01-17', status: 'absent' },
        { date: '2024-01-18', status: 'present' },
        { date: '2024-01-19', status: 'present' }
      ],
      marks: [
        { subject: 'Mathematics', score: 85, total: 100, date: '2024-01-10' },
        { subject: 'Science', score: 92, total: 100, date: '2024-01-10' },
        { subject: 'English', score: 78, total: 100, date: '2024-01-10' },
        { subject: 'History', score: 88, total: 100, date: '2024-01-10' }
      ]
    },
    {
      id: '2',
      name: 'Bob Smith',
      class: '10th Grade',
      rollNumber: '102',
      email: 'bob@example.com',
      phone: '+1234567891',
      attendance: [
        { date: '2024-01-15', status: 'present' },
        { date: '2024-01-16', status: 'absent' },
        { date: '2024-01-17', status: 'present' },
        { date: '2024-01-18', status: 'present' },
        { date: '2024-01-19', status: 'absent' }
      ],
      marks: [
        { subject: 'Mathematics', score: 72, total: 100, date: '2024-01-10' },
        { subject: 'Science', score: 68, total: 100, date: '2024-01-10' },
        { subject: 'English', score: 85, total: 100, date: '2024-01-10' },
        { subject: 'History', score: 79, total: 100, date: '2024-01-10' }
      ]
    },
    {
      id: '3',
      name: 'Charlie Brown',
      class: '9th Grade',
      rollNumber: '201',
      email: 'charlie@example.com',
      phone: '+1234567892',
      attendance: [
        { date: '2024-01-15', status: 'present' },
        { date: '2024-01-16', status: 'present' },
        { date: '2024-01-17', status: 'present' },
        { date: '2024-01-18', status: 'present' },
        { date: '2024-01-19', status: 'present' }
      ],
      marks: [
        { subject: 'Mathematics', score: 95, total: 100, date: '2024-01-10' },
        { subject: 'Science', score: 88, total: 100, date: '2024-01-10' },
        { subject: 'English', score: 92, total: 100, date: '2024-01-10' },
        { subject: 'History', score: 90, total: 100, date: '2024-01-10' }
      ]
    }
  ],
  notifications: [
    {
      id: 'n1',
      message: 'School will remain closed on Monday due to holiday',
      date: '2024-01-20T10:30:00Z',
      read: false,
      forAll: true
    },
    {
      id: 'n2',
      message: 'Parent-teacher meeting on Saturday at 10 AM',
      date: '2024-01-19T09:15:00Z',
      read: true,
      forAll: true
    },
    {
      id: 'n3',
      message: 'Science fair submissions due next week',
      date: '2024-01-18T14:20:00Z',
      read: false,
      forAll: true
    }
  ]
};