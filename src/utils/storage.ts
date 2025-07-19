import { FolderItem } from '../types';

const STORAGE_KEY = 'lms_data';

export const createInitialStructure = (): FolderItem[] => {
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const subjects = [
    'Programming Fundamentals',
    'Data Structures',
    'Database Systems',
    'Software Engineering',
    'Web Development',
    'Mobile Development',
    'AI & Machine Learning',
    'Computer Networks'
  ];

  return years.map((year, yearIndex) => ({
    id: `year-${yearIndex + 1}`,
    name: year,
    type: 'folder',
    children: subjects.slice(0, yearIndex + 3).map((subject, subjectIndex) => ({
      id: `year-${yearIndex + 1}-subject-${subjectIndex}`,
      name: subject,
      type: 'folder',
      children: [
        {
          id: `year-${yearIndex + 1}-subject-${subjectIndex}-papers`,
          name: 'Papers',
          type: 'folder',
          children: []
        },
        {
          id: `year-${yearIndex + 1}-subject-${subjectIndex}-slides`,
          name: 'Slides',
          type: 'folder',
          children: []
        }
      ]
    })),
    isExpanded: false
  }));
};

export const saveToStorage = (data: FolderItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadFromStorage = (): FolderItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const initial = createInitialStructure();
  saveToStorage(initial);
  return initial;
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};