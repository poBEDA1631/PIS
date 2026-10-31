const { CopyStatus } = require('../domain/constants');

const initialBooks = [
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000001',
    title: 'Кобзар',
    author: 'Тарас Шевченко',
    isbn: '9789660100001',
    genre: 'Поезія',
    description: 'Повна збірка поетичних творів Тараса Шевченка.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000002',
    title: 'Гайдамаки',
    author: 'Тарас Шевченко',
    isbn: '9789660100002',
    genre: 'Поезія',
    description: 'Поема Тараса Шевченка.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000003',
    title: 'Стародавня історія',
    author: 'Микола Костомаров',
    isbn: '9789660100003',
    genre: 'Історія',
    description: 'Історичне монографічне дослідження.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000004',
    title: 'Заповіт',
    author: 'Тарас Шевченко',
    isbn: '9789660100004',
    genre: 'Поезія',
    description: 'Поетичний твір-маніфест.',
    isArchived: false,
  },
];

const initialCopies = [
  {
    inventoryNumber: 'INV-1001',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000001',
    status: CopyStatus.AVAILABLE,
    location: 'Зала художньої літератури, стелаж 3',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1002',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000001',
    status: CopyStatus.AVAILABLE,
    location: 'Зала художньої літератури, стелаж 3',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1003',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000002',
    status: CopyStatus.BORROWED,
    location: 'На руках у читача',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1005',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000002',
    status: CopyStatus.RESERVED,
    location: 'Кафедра видачі',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1006',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000003',
    status: CopyStatus.LOST,
    location: 'Списано',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1004',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000004',
    status: CopyStatus.IN_REPAIR,
    location: 'Відділ реставрації',
    updatedAt: new Date().toISOString(),
  },
];

let books = JSON.parse(JSON.stringify(initialBooks));
let copies = JSON.parse(JSON.stringify(initialCopies));

module.exports = {
  books,
  copies,
  resetStore: () => {
    books = JSON.parse(JSON.stringify(initialBooks));
    copies = JSON.parse(JSON.stringify(initialCopies));
  },
};
