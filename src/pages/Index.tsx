
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Calendar,
  Trash2,
  Filter,
  BarChart3
} from "lucide-react";
import {
  Transaction,
  getTransactions,
  formatCurrency,
  formatDate,
  deleteTransaction,
  calculateTotalIncome,
  calculateTotalExpense,
  getCategoryById,
  getExpensesByCategory,
  getCategories,
  Category
} from "@/utils/financeUtils";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import TransactionForm from "@/components/ui/TransactionForm";
import FinanceCard from "@/components/ui/FinanceCard";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [balance, setBalance] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTransactions = getTransactions();
    const loadedCategories = getCategories();
    setTransactions(loadedTransactions);
    setCategories(loadedCategories);
    
    const totalIncome = calculateTotalIncome(loadedTransactions);
    const totalExpense = calculateTotalExpense(loadedTransactions);
    
    setIncome(totalIncome);
    setExpenses(totalExpense);
    setBalance(totalIncome - totalExpense);
  };

  const handleDelete = (id: string) => {
    try {
      deleteTransaction(id);
      toast.success("Transaction deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const filteredTransactions = activeTab === "all" 
    ? transactions 
    : transactions.filter(t => t.type === activeTab);

  // Prepare data for pie chart
  const expensesByCategory = getExpensesByCategory(transactions);
  const pieChartData = Object.entries(expensesByCategory).map(([categoryId, amount]) => {
    const category = getCategoryById(categoryId);
    return {
      name: category?.name || "Uncategorized",
      value: amount,
      color: category?.color || "#666",
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your personal finances
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <FinanceCard
            title="Total Balance"
            value={formatCurrency(balance)}
            icon={<Wallet className="h-4 w-4 text-primary" />}
            valueClassName={cn(
              balance >= 0 ? "text-green-600" : "text-red-600"
            )}
          />
          <FinanceCard
            title="Total Income"
            value={formatCurrency(income)}
            icon={<ArrowUpCircle className="h-4 w-4 text-green-600" />}
            valueClassName="text-green-600"
          />
          <FinanceCard
            title="Total Expenses"
            value={formatCurrency(expenses)}
            icon={<ArrowDownCircle className="h-4 w-4 text-red-600" />}
            valueClassName="text-red-600"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1 h-full">
            <CardHeader className="pb-3">
              <CardTitle>Add Transaction</CardTitle>
              <CardDescription>Record a new transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm onSuccess={loadData} />
            </CardContent>
          </Card>

          <Card className="md:col-span-1 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Expense Breakdown</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>Your spending by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No expense data to display</p>
                  <p className="text-sm">Add expenses to see your breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expenses</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No transactions found</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setActiveTab("all")}
                  >
                    <Filter className="mr-2 h-4 w-4" /> Clear filters
                  </Button>
                </div>
              ) : (
                filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => {
                    const category = transaction.categoryId
                      ? getCategoryById(transaction.categoryId)
                      : undefined;

                    return (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            transaction.type === "income" 
                              ? "bg-green-100" 
                              : category 
                                ? "opacity-80"
                                : "bg-red-100"
                          )}
                          style={{
                            backgroundColor: transaction.type === "expense" && category 
                              ? category.color + "33"  // Add transparency
                              : undefined
                          }}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(transaction.date)}
                              {category && (
                                <>
                                  <Separator orientation="vertical" className="mx-2 h-3" />
                                  <div className="flex items-center">
                                    <div
                                      className="w-2 h-2 rounded-full mr-1"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "font-medium",
                            transaction.type === "income" 
                              ? "text-green-600" 
                              : "text-red-600"
                          )}>
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
