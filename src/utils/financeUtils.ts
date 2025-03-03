
export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  categoryId?: string;
};

// Initial categories
export const defaultCategories: Category[] = [
  { id: "cat1", name: "Groceries", color: "#4CAF50" },
  { id: "cat2", name: "Transportation", color: "#2196F3" },
  { id: "cat3", name: "Utilities", color: "#FF9800" },
  { id: "cat4", name: "Rent", color: "#9C27B0" },
  { id: "cat5", name: "Entertainment", color: "#F44336" },
  { id: "cat6", name: "Dining", color: "#795548" },
  { id: "cat7", name: "Healthcare", color: "#607D8B" },
  { id: "cat8", name: "Education", color: "#3F51B5" },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Get transactions from local storage
export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem("transactions");
  return transactions ? JSON.parse(transactions) : [];
};

// Save transactions to local storage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Calculate total income
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
};

// Calculate total expenses
export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
};

// Get categories from local storage
export const getCategories = (): Category[] => {
  const categories = localStorage.getItem("categories");
  // Initialize with default categories if none exist
  if (!categories) {
    localStorage.setItem("categories", JSON.stringify(defaultCategories));
    return defaultCategories;
  }
  return JSON.parse(categories);
};

// Save categories to local storage
export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem("categories", JSON.stringify(categories));
};

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Add a new transaction
export const addTransaction = (transaction: Omit<Transaction, "id">): Transaction => {
  const transactions = getTransactions();
  const newTransaction = { ...transaction, id: generateId() };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

// Delete a transaction
export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.filter((t) => t.id !== id);
  saveTransactions(updatedTransactions);
};

// Add a category
export const addCategory = (name: string, color: string): Category => {
  const categories = getCategories();
  const newCategory = { id: generateId(), name, color };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

// Update a category
export const updateCategory = (id: string, name: string, color: string): Category => {
  const categories = getCategories();
  const updatedCategories = categories.map((cat) =>
    cat.id === id ? { ...cat, name, color } : cat
  );
  saveCategories(updatedCategories);
  return { id, name, color };
};

// Delete a category
export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  const updatedCategories = categories.filter((cat) => cat.id !== id);
  saveCategories(updatedCategories);
  
  // Update transactions that use this category
  const transactions = getTransactions();
  const updatedTransactions = transactions.map((t) => {
    if (t.categoryId === id) {
      // Remove category from transaction
      const { categoryId, ...rest } = t;
      return rest;
    }
    return t;
  });
  saveTransactions(updatedTransactions);
};

// Get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  const categories = getCategories();
  return categories.find((cat) => cat.id === id);
};

// Get expenses grouped by category
export const getExpensesByCategory = (transactions: Transaction[]): Record<string, number> => {
  const expensesByCategory: Record<string, number> = {};
  
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      if (t.categoryId) {
        if (expensesByCategory[t.categoryId]) {
          expensesByCategory[t.categoryId] += t.amount;
        } else {
          expensesByCategory[t.categoryId] = t.amount;
        }
      }
    });
  
  return expensesByCategory;
};
